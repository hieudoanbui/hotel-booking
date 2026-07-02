<?php

namespace App\Controllers;

use PDO;
use Throwable;
use App\Models\Promotion;
use App\Helpers\Request;
use App\Helpers\Response;
use App\Middlewares\AuthMiddleware;

class PromotionController
{
    private Promotion $promotionModel;

    public function __construct(PDO $db)
    {
        $this->promotionModel = new Promotion($db);
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
            $this->requireAdmin();

            $promotions = $this->promotionModel->getAll();

            Response::success("Lấy danh sách mã khuyến mãi thành công.", [
                "promotions" => $promotions
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy danh sách mã khuyến mãi: " . $e->getMessage(), 500);
        }
    }

    public function store(): void
    {
        try {
            $this->requireAdmin();

            $data = Request::input();

            $code = strtoupper(trim($data["code"] ?? ""));
            $name = trim($data["name"] ?? "");
            $discountType = trim($data["discount_type"] ?? "percent");
            $discountValue = (float) ($data["discount_value"] ?? 0);
            $startDate = trim($data["start_date"] ?? "");
            $endDate = trim($data["end_date"] ?? "");
            $status = trim($data["status"] ?? "active");

            if ($code === "" || $name === "") {
                Response::error("Vui lòng nhập mã khuyến mãi và tên chương trình.");
            }

            if (!in_array($discountType, ["percent", "fixed"])) {
                Response::error("Loại giảm giá không hợp lệ.");
            }

            if ($discountValue <= 0) {
                Response::error("Giá trị giảm giá phải lớn hơn 0.");
            }

            if ($discountType === "percent" && $discountValue > 100) {
                Response::error("Giảm giá theo phần trăm không được vượt quá 100%.");
            }

            if (!in_array($status, ["active", "inactive"])) {
                $status = "active";
            }

            if ($startDate === "") {
                $startDate = null;
            }

            if ($endDate === "") {
                $endDate = null;
            }

            if ($startDate && $endDate && $startDate > $endDate) {
                Response::error("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
            }

            $existingPromotion = $this->promotionModel->findByCode($code);

            if ($existingPromotion) {
                Response::error("Mã khuyến mãi này đã tồn tại.");
            }

            $created = $this->promotionModel->create([
                "code" => $code,
                "name" => $name,
                "discount_type" => $discountType,
                "discount_value" => $discountValue,
                "start_date" => $startDate,
                "end_date" => $endDate,
                "status" => $status
            ]);

            if (!$created) {
                Response::error("Thêm mã khuyến mãi thất bại.");
            }

            Response::success("Thêm mã khuyến mãi thành công.", [], 201);
        } catch (Throwable $e) {
            Response::error("Lỗi khi thêm mã khuyến mãi: " . $e->getMessage(), 500);
        }
    }

    public function update(string $id): void
    {
        try {
            $this->requireAdmin();

            $promotionId = (int) $id;
            $data = Request::input();

            if ($promotionId <= 0) {
                Response::error("Mã ID khuyến mãi không hợp lệ.");
            }

            $promotion = $this->promotionModel->findById($promotionId);

            if (!$promotion) {
                Response::error("Không tìm thấy mã khuyến mãi.", 404);
            }

            $code = strtoupper(trim($data["code"] ?? ""));
            $name = trim($data["name"] ?? "");
            $discountType = trim($data["discount_type"] ?? "percent");
            $discountValue = (float) ($data["discount_value"] ?? 0);
            $startDate = trim($data["start_date"] ?? "");
            $endDate = trim($data["end_date"] ?? "");
            $status = trim($data["status"] ?? "active");

            if ($code === "" || $name === "") {
                Response::error("Vui lòng nhập mã khuyến mãi và tên chương trình.");
            }

            if (!in_array($discountType, ["percent", "fixed"])) {
                Response::error("Loại giảm giá không hợp lệ.");
            }

            if ($discountValue <= 0) {
                Response::error("Giá trị giảm giá phải lớn hơn 0.");
            }

            if ($discountType === "percent" && $discountValue > 100) {
                Response::error("Giảm giá theo phần trăm không được vượt quá 100%.");
            }

            if (!in_array($status, ["active", "inactive"])) {
                $status = "active";
            }

            if ($startDate === "") {
                $startDate = null;
            }

            if ($endDate === "") {
                $endDate = null;
            }

            if ($startDate && $endDate && $startDate > $endDate) {
                Response::error("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
            }

            $existingPromotion = $this->promotionModel->findByCode($code);

            if ($existingPromotion && (int) $existingPromotion["id"] !== $promotionId) {
                Response::error("Mã khuyến mãi này đã được sử dụng.");
            }

            $updated = $this->promotionModel->update($promotionId, [
                "code" => $code,
                "name" => $name,
                "discount_type" => $discountType,
                "discount_value" => $discountValue,
                "start_date" => $startDate,
                "end_date" => $endDate,
                "status" => $status
            ]);

            if (!$updated) {
                Response::error("Cập nhật mã khuyến mãi thất bại.");
            }

            Response::success("Cập nhật mã khuyến mãi thành công.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi cập nhật mã khuyến mãi: " . $e->getMessage(), 500);
        }
    }

    public function destroy(string $id): void
    {
        try {
            $this->requireAdmin();

            $promotionId = (int) $id;

            if ($promotionId <= 0) {
                Response::error("Mã ID khuyến mãi không hợp lệ.");
            }

            $promotion = $this->promotionModel->findById($promotionId);

            if (!$promotion) {
                Response::error("Không tìm thấy mã khuyến mãi.", 404);
            }

            $hidden = $this->promotionModel->hide($promotionId);

            if (!$hidden) {
                Response::error("Ẩn mã khuyến mãi thất bại.");
            }

            Response::success("Ẩn mã khuyến mãi thành công.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi ẩn mã khuyến mãi: " . $e->getMessage(), 500);
        }
    }
}