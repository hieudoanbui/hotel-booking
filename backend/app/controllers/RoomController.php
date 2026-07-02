<?php

namespace App\Controllers;

use PDO;
use Throwable;
use App\Models\Room;
use App\Helpers\Request;
use App\Helpers\Response;
use App\Middlewares\AuthMiddleware;

class RoomController
{
    private PDO $conn;
    private Room $roomModel;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
        $this->roomModel = new Room($db);
    }

    public function index(): void
    {
        $rooms = $this->roomModel->getAll();

        Response::success("Lấy danh sách phòng thành công.", [
            "rooms" => $rooms
        ]);
    }

    public function availableRooms(): void
    {
        try {
            $checkIn = $_GET["check_in"] ?? "";
            $checkOut = $_GET["check_out"] ?? "";
            $capacity = (int) ($_GET["capacity"] ?? 1);

            if ($checkIn === "" || $checkOut === "") {
                Response::error("Vui lòng chọn ngày nhận phòng và ngày trả phòng.");
            }

            if (strtotime($checkIn) >= strtotime($checkOut)) {
                Response::error("Ngày trả phòng phải sau ngày nhận phòng.");
            }

            if ($capacity <= 0) {
                Response::error("Số người phải lớn hơn 0.");
            }

            $sql = "SELECT 
                        r.*,
                        rt.name AS room_type
                    FROM rooms r
                    LEFT JOIN room_types rt ON r.room_type_id = rt.id
                    WHERE r.status = 'active'
                    AND r.capacity >= :capacity
                    AND r.id NOT IN (
                        SELECT b.room_id
                        FROM bookings b
                        WHERE b.status IN ('pending', 'confirmed')
                        AND NOT (
                            b.check_out <= :check_in
                            OR b.check_in >= :check_out
                        )
                    )
                    ORDER BY r.price ASC";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":capacity", $capacity, PDO::PARAM_INT);
            $stmt->bindParam(":check_in", $checkIn);
            $stmt->bindParam(":check_out", $checkOut);
            $stmt->execute();

            $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);

            Response::success("Lấy danh sách phòng trống thành công.", [
                "rooms" => $rooms
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi tìm phòng trống: " . $e->getMessage(), 500);
        }
    }

    public function show(string $id): void
    {
        $room = $this->roomModel->findById((int) $id);

        if (!$room) {
            Response::error("Không tìm thấy phòng.", 404);
        }

        Response::success("Lấy thông tin phòng thành công.", [
            "room" => $room
        ]);
    }

    public function store(): void
    {
        AuthMiddleware::requireAdmin();

        $data = Request::input();

        $roomTypeId = (int) ($data["room_type_id"] ?? 0);
        $roomNumber = trim($data["room_number"] ?? "");
        $title = trim($data["title"] ?? "");
        $description = trim($data["description"] ?? "");
        $price = (float) ($data["price"] ?? 0);
        $capacity = (int) ($data["capacity"] ?? 0);
        $image = trim($data["image"] ?? "default-room.jpg");
        $status = trim($data["status"] ?? "active");

        if ($roomTypeId <= 0 || $roomNumber === "" || $title === "" || $price <= 0 || $capacity <= 0) {
            Response::error("Vui lòng nhập đầy đủ thông tin phòng.");
        }

        if (!in_array($status, ["active", "maintenance"])) {
            Response::error("Trạng thái phòng không hợp lệ.");
        }

        $existingRoom = $this->roomModel->findByRoomNumber($roomNumber);

        if ($existingRoom) {
            Response::error("Số phòng đã tồn tại.");
        }

        $created = $this->roomModel->create([
            "room_type_id" => $roomTypeId,
            "room_number" => $roomNumber,
            "title" => $title,
            "description" => $description,
            "price" => $price,
            "capacity" => $capacity,
            "image" => $image,
            "status" => $status
        ]);

        if (!$created) {
            Response::error("Thêm phòng thất bại.");
        }

        Response::success("Thêm phòng thành công.", [], 201);
    }

    public function update(string $id): void
    {
        AuthMiddleware::requireAdmin();

        $roomId = (int) $id;
        $room = $this->roomModel->findById($roomId);

        if (!$room) {
            Response::error("Không tìm thấy phòng cần sửa.", 404);
        }

        $data = Request::input();

        $roomTypeId = (int) ($data["room_type_id"] ?? $room["room_type_id"]);
        $roomNumber = trim($data["room_number"] ?? $room["room_number"]);
        $title = trim($data["title"] ?? $room["title"]);
        $description = trim($data["description"] ?? $room["description"]);
        $price = (float) ($data["price"] ?? $room["price"]);
        $capacity = (int) ($data["capacity"] ?? $room["capacity"]);
        $image = trim($data["image"] ?? $room["image"]);
        $status = trim($data["status"] ?? $room["status"]);

        if ($roomTypeId <= 0 || $roomNumber === "" || $title === "" || $price <= 0 || $capacity <= 0) {
            Response::error("Vui lòng nhập đầy đủ thông tin phòng.");
        }

        if (!in_array($status, ["active", "maintenance"])) {
            Response::error("Trạng thái phòng không hợp lệ.");
        }

        $existingRoom = $this->roomModel->findByRoomNumber($roomNumber, $roomId);

        if ($existingRoom) {
            Response::error("Số phòng đã tồn tại.");
        }

        $updated = $this->roomModel->update($roomId, [
            "room_type_id" => $roomTypeId,
            "room_number" => $roomNumber,
            "title" => $title,
            "description" => $description,
            "price" => $price,
            "capacity" => $capacity,
            "image" => $image,
            "status" => $status
        ]);

        if (!$updated) {
            Response::error("Cập nhật phòng thất bại.");
        }

        Response::success("Cập nhật phòng thành công.");
    }

    public function destroy(string $id): void
    {
        AuthMiddleware::requireAdmin();

        $roomId = (int) $id;
        $room = $this->roomModel->findById($roomId);

        if (!$room) {
            Response::error("Không tìm thấy phòng cần xóa.", 404);
        }

        $deleted = $this->roomModel->delete($roomId);

        if (!$deleted) {
            Response::error("Xóa phòng thất bại.");
        }

        Response::success("Xóa phòng thành công.");
    }
}