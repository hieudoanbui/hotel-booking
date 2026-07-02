<?php

namespace App\Controllers;

use PDO;
use Throwable;
use App\Models\Amenity;
use App\Helpers\Request;
use App\Helpers\Response;
use App\Middlewares\AuthMiddleware;

class AmenityController
{
    private Amenity $amenityModel;

    public function __construct(PDO $db)
    {
        $this->amenityModel = new Amenity($db);
    }

    private function requireAdmin(): void
    {
        AuthMiddleware::requireLogin();

        $role = $_SESSION["role"] ?? $_SESSION["user_role"] ?? "";

        if ($role !== "admin") {
            Response::error("Bạn không có quyền thực hiện chức năng này.", 403);
        }
    }

    public function roomAmenities(string $id): void
    {
        try {
            $roomId = (int) $id;

            if ($roomId <= 0) {
                Response::error("Mã phòng không hợp lệ.");
            }

            $amenities = $this->amenityModel->getByRoomId($roomId);

            Response::success("Lấy tiện nghi phòng thành công.", [
                "amenities" => $amenities
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy tiện nghi phòng: " . $e->getMessage(), 500);
        }
    }

    public function index(): void
    {
        try {
            $this->requireAdmin();

            $amenities = $this->amenityModel->getAll();

            Response::success("Lấy danh sách tiện nghi thành công.", [
                "amenities" => $amenities
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy danh sách tiện nghi: " . $e->getMessage(), 500);
        }
    }

    public function store(): void
    {
        try {
            $this->requireAdmin();

            $data = Request::input();

            $name = trim($data["name"] ?? "");
            $icon = trim($data["icon"] ?? "");
            $description = trim($data["description"] ?? "");

            if ($name === "") {
                Response::error("Vui lòng nhập tên tiện nghi.");
            }

            $created = $this->amenityModel->create([
                "name" => $name,
                "icon" => $icon,
                "description" => $description
            ]);

            if (!$created) {
                Response::error("Thêm tiện nghi thất bại.");
            }

            Response::success("Thêm tiện nghi thành công.", [], 201);
        } catch (Throwable $e) {
            Response::error("Lỗi khi thêm tiện nghi: " . $e->getMessage(), 500);
        }
    }

    public function update(string $id): void
    {
        try {
            $this->requireAdmin();

            $amenityId = (int) $id;
            $data = Request::input();

            if ($amenityId <= 0) {
                Response::error("Mã tiện nghi không hợp lệ.");
            }

            $amenity = $this->amenityModel->findById($amenityId);

            if (!$amenity) {
                Response::error("Không tìm thấy tiện nghi.", 404);
            }

            $name = trim($data["name"] ?? "");
            $icon = trim($data["icon"] ?? "");
            $description = trim($data["description"] ?? "");

            if ($name === "") {
                Response::error("Vui lòng nhập tên tiện nghi.");
            }

            $updated = $this->amenityModel->update($amenityId, [
                "name" => $name,
                "icon" => $icon,
                "description" => $description
            ]);

            if (!$updated) {
                Response::error("Cập nhật tiện nghi thất bại.");
            }

            Response::success("Cập nhật tiện nghi thành công.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi cập nhật tiện nghi: " . $e->getMessage(), 500);
        }
    }

    public function destroy(string $id): void
    {
        try {
            $this->requireAdmin();

            $amenityId = (int) $id;

            if ($amenityId <= 0) {
                Response::error("Mã tiện nghi không hợp lệ.");
            }

            $amenity = $this->amenityModel->findById($amenityId);

            if (!$amenity) {
                Response::error("Không tìm thấy tiện nghi.", 404);
            }

            $deleted = $this->amenityModel->delete($amenityId);

            if (!$deleted) {
                Response::error("Xóa tiện nghi thất bại.");
            }

            Response::success("Xóa tiện nghi thành công.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi xóa tiện nghi: " . $e->getMessage(), 500);
        }
    }

    public function getRoomAmenityIds(string $id): void
    {
        try {
            $this->requireAdmin();

            $roomId = (int) $id;

            if ($roomId <= 0) {
                Response::error("Mã phòng không hợp lệ.");
            }

            $amenityIds = $this->amenityModel->getAmenityIdsByRoomId($roomId);

            Response::success("Lấy danh sách ID tiện nghi của phòng thành công.", [
                "amenity_ids" => $amenityIds
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy ID tiện nghi phòng: " . $e->getMessage(), 500);
        }
    }

    public function updateRoomAmenities(string $id): void
    {
        try {
            $this->requireAdmin();

            $roomId = (int) $id;
            $data = Request::input();

            if ($roomId <= 0) {
                Response::error("Mã phòng không hợp lệ.");
            }

            $amenityIds = $data["amenity_ids"] ?? [];

            if (!is_array($amenityIds)) {
                Response::error("Danh sách tiện nghi không hợp lệ.");
            }

            $updated = $this->amenityModel->updateRoomAmenities($roomId, $amenityIds);

            if (!$updated) {
                Response::error("Cập nhật tiện nghi cho phòng thất bại.");
            }

            Response::success("Cập nhật tiện nghi cho phòng thành công.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi cập nhật tiện nghi cho phòng: " . $e->getMessage(), 500);
        }
    }
}