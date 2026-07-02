<?php

namespace App\Controllers;

use PDO;
use Throwable;
use App\Models\RoomType;
use App\Helpers\Request;
use App\Helpers\Response;
use App\Middlewares\AuthMiddleware;

class RoomTypeController
{
    private RoomType $roomTypeModel;

    public function __construct(PDO $db)
    {
        $this->roomTypeModel = new RoomType($db);
    }

    private function requireAdmin(): void
    {
        AuthMiddleware::requireLogin();

        $role = $_SESSION["role"] ?? $_SESSION["user_role"] ?? "";

        if ($role !== "admin") {
            Response::error("Bạn không có quyền thực hiện chức năng này.", 403);
        }
    }

    public function index(): void
    {
        try {
            $roomTypes = $this->roomTypeModel->getAll();

            Response::success("Lấy danh sách loại phòng thành công.", [
                "room_types" => $roomTypes
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy danh sách loại phòng: " . $e->getMessage(), 500);
        }
    }

    public function adminIndex(): void
    {
        try {
            $this->requireAdmin();

            $roomTypes = $this->roomTypeModel->getAll();

            Response::success("Lấy danh sách loại phòng admin thành công.", [
                "room_types" => $roomTypes
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy danh sách loại phòng admin: " . $e->getMessage(), 500);
        }
    }

    public function store(): void
    {
        try {
            $this->requireAdmin();

            $data = Request::input();

            $name = trim($data["name"] ?? "");
            $description = trim($data["description"] ?? "");

            if ($name === "") {
                Response::error("Vui lòng nhập tên loại phòng.");
            }

            $created = $this->roomTypeModel->create([
                "name" => $name,
                "description" => $description
            ]);

            if (!$created) {
                Response::error("Thêm loại phòng thất bại.");
            }

            Response::success("Thêm loại phòng thành công.", [], 201);
        } catch (Throwable $e) {
            Response::error("Lỗi khi thêm loại phòng: " . $e->getMessage(), 500);
        }
    }

    public function update(string $id): void
    {
        try {
            $this->requireAdmin();

            $roomTypeId = (int) $id;
            $data = Request::input();

            if ($roomTypeId <= 0) {
                Response::error("Mã loại phòng không hợp lệ.");
            }

            $roomType = $this->roomTypeModel->findById($roomTypeId);

            if (!$roomType) {
                Response::error("Không tìm thấy loại phòng.", 404);
            }

            $name = trim($data["name"] ?? "");
            $description = trim($data["description"] ?? "");

            if ($name === "") {
                Response::error("Vui lòng nhập tên loại phòng.");
            }

            $updated = $this->roomTypeModel->update($roomTypeId, [
                "name" => $name,
                "description" => $description
            ]);

            if (!$updated) {
                Response::error("Cập nhật loại phòng thất bại.");
            }

            Response::success("Cập nhật loại phòng thành công.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi cập nhật loại phòng: " . $e->getMessage(), 500);
        }
    }

    public function destroy(string $id): void
    {
        try {
            $this->requireAdmin();

            $roomTypeId = (int) $id;

            if ($roomTypeId <= 0) {
                Response::error("Mã loại phòng không hợp lệ.");
            }

            $roomType = $this->roomTypeModel->findById($roomTypeId);

            if (!$roomType) {
                Response::error("Không tìm thấy loại phòng.", 404);
            }

            if ($this->roomTypeModel->hasRooms($roomTypeId)) {
                Response::error("Không thể xóa loại phòng đang được sử dụng bởi phòng hiện có.");
            }

            $deleted = $this->roomTypeModel->delete($roomTypeId);

            if (!$deleted) {
                Response::error("Xóa loại phòng thất bại.");
            }

            Response::success("Xóa loại phòng thành công.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi xóa loại phòng: " . $e->getMessage(), 500);
        }
    }
}