<?php

namespace App\Controllers;

use PDO;
use Throwable;
use App\Models\Review;
use App\Helpers\Request;
use App\Helpers\Response;
use App\Middlewares\AuthMiddleware;

class ReviewController
{
    private Review $reviewModel;

    public function __construct(PDO $db)
    {
        $this->reviewModel = new Review($db);
    }

    private function requireAdmin(): void
    {
        AuthMiddleware::requireLogin();

        $role = $_SESSION["role"] ?? $_SESSION["user_role"] ?? "";

        if ($role !== "admin") {
            Response::error("Bạn không có quyền thực hiện chức năng này.", 403);
        }
    }

    private function getCurrentUserId(): int
    {
        AuthMiddleware::requireLogin();

        $userId = $_SESSION["user_id"] ?? $_SESSION["id"] ?? null;

        if (!$userId) {
            Response::error("Không tìm thấy thông tin người dùng.", 401);
        }

        return (int) $userId;
    }

    public function getByRoom(string $id): void
    {
        try {
            $roomId = (int) $id;

            if ($roomId <= 0) {
                Response::error("Mã phòng không hợp lệ.");
            }

            $reviews = $this->reviewModel->getByRoomId($roomId);

            Response::success("Lấy đánh giá phòng thành công.", [
                "reviews" => $reviews
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy đánh giá phòng: " . $e->getMessage(), 500);
        }
    }

    public function store(): void
    {
        try {
            $userId = $this->getCurrentUserId();
            $data = Request::input();

            $roomId = (int) ($data["room_id"] ?? 0);
            $rating = (int) ($data["rating"] ?? 0);
            $comment = trim($data["comment"] ?? "");

            if ($roomId <= 0) {
                Response::error("Mã phòng không hợp lệ.");
            }

            if ($rating < 1 || $rating > 5) {
                Response::error("Số sao đánh giá phải từ 1 đến 5.");
            }

            if ($comment === "") {
                Response::error("Vui lòng nhập nội dung đánh giá.");
            }

            $created = $this->reviewModel->create([
                "user_id" => $userId,
                "room_id" => $roomId,
                "rating" => $rating,
                "comment" => $comment
            ]);

            if (!$created) {
                Response::error("Gửi đánh giá thất bại.");
            }

            Response::success("Gửi đánh giá thành công.", [], 201);
        } catch (Throwable $e) {
            Response::error("Lỗi khi gửi đánh giá: " . $e->getMessage(), 500);
        }
    }

    public function adminIndex(): void
    {
        try {
            $this->requireAdmin();

            $reviews = $this->reviewModel->getAllForAdmin();

            Response::success("Lấy danh sách đánh giá thành công.", [
                "reviews" => $reviews
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy danh sách đánh giá: " . $e->getMessage(), 500);
        }
    }

    public function destroy(string $id): void
    {
        try {
            $this->requireAdmin();

            $reviewId = (int) $id;

            if ($reviewId <= 0) {
                Response::error("Mã đánh giá không hợp lệ.");
            }

            $review = $this->reviewModel->findById($reviewId);

            if (!$review) {
                Response::error("Không tìm thấy đánh giá.", 404);
            }

            $deleted = $this->reviewModel->delete($reviewId);

            if (!$deleted) {
                Response::error("Xóa đánh giá thất bại.");
            }

            Response::success("Xóa đánh giá thành công.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi xóa đánh giá: " . $e->getMessage(), 500);
        }
    }
}