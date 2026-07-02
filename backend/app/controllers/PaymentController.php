<?php

namespace App\Controllers;

use PDO;
use Throwable;
use App\Models\Payment;
use App\Helpers\Response;
use App\Middlewares\AuthMiddleware;

class PaymentController
{
    private $paymentModel;

    public function __construct(PDO $db)
    {
        $this->paymentModel = new Payment($db);
    }

    private function requireAdmin()
    {
        AuthMiddleware::requireLogin();

        $role = $_SESSION["role"] ?? $_SESSION["user_role"] ?? "";

        if ($role !== "admin") {
            Response::error("Bạn không có quyền thực hiện chức năng này.", 403);
        }
    }

    public function index()
    {
        try {
            $this->requireAdmin();

            $payments = $this->paymentModel->getAll();

            Response::success("Lấy danh sách thanh toán thành công.", [
                "payments" => $payments
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy danh sách thanh toán: " . $e->getMessage(), 500);
        }
    }

    public function markAsPaid($id)
    {
        try {
            $this->requireAdmin();

            $paymentId = (int) $id;

            if ($paymentId <= 0) {
                Response::error("Mã thanh toán không hợp lệ.");
            }

            $updated = $this->paymentModel->markAsPaid($paymentId);

            if (!$updated) {
                Response::error("Cập nhật thanh toán thất bại.");
            }

            Response::success("Đã xác nhận thanh toán thành công.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi cập nhật thanh toán: " . $e->getMessage(), 500);
        }
    }
}