<?php

namespace App\Controllers;

use PDO;
use Throwable;
use App\Models\RoomImage;
use App\Helpers\Request;
use App\Helpers\Response;
use App\Middlewares\AuthMiddleware;

class RoomImageController
{
    private RoomImage $roomImageModel;

    public function __construct(PDO $db)
    {
        $this->roomImageModel = new RoomImage($db);
    }

    private function requireAdmin(): void
    {
        AuthMiddleware::requireLogin();

        $role = $_SESSION["role"] ?? $_SESSION["user_role"] ?? "";

        if ($role !== "admin") {
            Response::error("Bạn không có quyền thực hiện chức năng này.", 403);
        }
    }

    public function getByRoom(string $id): void
    {
        try {
            $roomId = (int) $id;

            if ($roomId <= 0) {
                Response::error("Mã phòng không hợp lệ.");
            }

            $images = $this->roomImageModel->getByRoomId($roomId);

            Response::success("Lấy danh sách ảnh phòng thành công.", [
                "images" => $images
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy ảnh phòng: " . $e->getMessage(), 500);
        }
    }

    public function adminIndex(): void
    {
        try {
            $this->requireAdmin();

            $images = $this->roomImageModel->getAllForAdmin();

            Response::success("Lấy danh sách ảnh phòng admin thành công.", [
                "images" => $images
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy danh sách ảnh phòng: " . $e->getMessage(), 500);
        }
    }

    public function store(): void
    {
        try {
            $this->requireAdmin();

            $data = Request::input();

            $roomId = (int) ($data["room_id"] ?? 0);
            $imageUrl = trim($data["image_url"] ?? "");
            $isMain = (int) ($data["is_main"] ?? 0);

            if ($roomId <= 0) {
                Response::error("Vui lòng chọn phòng.");
            }

            if ($imageUrl === "") {
                Response::error("Vui lòng nhập đường dẫn ảnh.");
            }

            $created = $this->roomImageModel->create([
                "room_id" => $roomId,
                "image_url" => $imageUrl,
                "is_main" => $isMain
            ]);

            if (!$created) {
                Response::error("Thêm ảnh phòng thất bại.");
            }

            Response::success("Thêm ảnh phòng thành công.", [], 201);
        } catch (Throwable $e) {
            Response::error("Lỗi khi thêm ảnh phòng: " . $e->getMessage(), 500);
        }
    }

    public function update(string $id): void
    {
        try {
            $this->requireAdmin();

            $imageId = (int) $id;
            $data = Request::input();

            if ($imageId <= 0) {
                Response::error("Mã ảnh không hợp lệ.");
            }

            $image = $this->roomImageModel->findById($imageId);

            if (!$image) {
                Response::error("Không tìm thấy ảnh phòng.", 404);
            }

            $roomId = (int) ($data["room_id"] ?? 0);
            $imageUrl = trim($data["image_url"] ?? "");
            $isMain = (int) ($data["is_main"] ?? 0);

            if ($roomId <= 0) {
                Response::error("Vui lòng chọn phòng.");
            }

            if ($imageUrl === "") {
                Response::error("Vui lòng nhập đường dẫn ảnh.");
            }

            $updated = $this->roomImageModel->update($imageId, [
                "room_id" => $roomId,
                "image_url" => $imageUrl,
                "is_main" => $isMain
            ]);

            if (!$updated) {
                Response::error("Cập nhật ảnh phòng thất bại.");
            }

            Response::success("Cập nhật ảnh phòng thành công.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi cập nhật ảnh phòng: " . $e->getMessage(), 500);
        }
    }

    public function destroy(string $id): void
    {
        try {
            $this->requireAdmin();

            $imageId = (int) $id;

            if ($imageId <= 0) {
                Response::error("Mã ảnh không hợp lệ.");
            }

            $image = $this->roomImageModel->findById($imageId);

            if (!$image) {
                Response::error("Không tìm thấy ảnh phòng.", 404);
            }

            $deleted = $this->roomImageModel->delete($imageId);

            if (!$deleted) {
                Response::error("Xóa ảnh phòng thất bại.");
            }

            Response::success("Xóa ảnh phòng thành công.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi xóa ảnh phòng: " . $e->getMessage(), 500);
        }
    }
}