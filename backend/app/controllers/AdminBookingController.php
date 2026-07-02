<?php

namespace App\Controllers;

use PDO;
use Throwable;
use App\Models\Booking;
use App\Models\Invoice;
use App\Helpers\Response;
use App\Middlewares\AuthMiddleware;

class AdminBookingController
{
    private PDO $conn;
    private Booking $bookingModel;
    private Invoice $invoiceModel;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
        $this->bookingModel = new Booking($db);
        $this->invoiceModel = new Invoice($db);
    }

    public function index(): void
    {
        try {
            AuthMiddleware::requireAdmin();

            $bookings = $this->bookingModel->getAllForAdmin();

            Response::success("Lấy danh sách đơn đặt phòng thành công.", [
                "bookings" => $bookings
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy danh sách đơn: " . $e->getMessage(), 500);
        }
    }

    public function show(string $id): void
    {
        try {
            AuthMiddleware::requireAdmin();

            $bookingId = (int) $id;

            $sql = "SELECT 
                        b.*,
                        u.name AS customer_name,
                        u.email AS customer_email,
                        u.phone AS customer_phone,
                        r.room_number,
                        r.title AS room_title,
                        r.description AS room_description,
                        r.price AS room_price,
                        r.capacity,
                        rt.name AS room_type,
                        i.id AS invoice_id,
                        i.invoice_code,
                        i.amount AS invoice_total,
                        i.payment_status AS invoice_status
                    FROM bookings b
                    LEFT JOIN users u ON b.user_id = u.id
                    LEFT JOIN rooms r ON b.room_id = r.id
                    LEFT JOIN room_types rt ON r.room_type_id = rt.id
                    LEFT JOIN invoices i ON i.booking_id = b.id
                    WHERE b.id = :id
                    LIMIT 1";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(":id", $bookingId, PDO::PARAM_INT);
            $stmt->execute();

            $booking = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$booking) {
                Response::error("Không tìm thấy đơn đặt phòng.", 404);
            }

            $serviceSql = "SELECT 
                               bs.*,
                               s.name,
                               s.description,
                               s.price
                           FROM booking_services bs
                           LEFT JOIN services s ON bs.service_id = s.id
                           WHERE bs.booking_id = :booking_id";

            $serviceStmt = $this->conn->prepare($serviceSql);
            $serviceStmt->bindValue(":booking_id", $bookingId, PDO::PARAM_INT);
            $serviceStmt->execute();

            $services = $serviceStmt->fetchAll(PDO::FETCH_ASSOC);

            $paymentSql = "SELECT *
                           FROM payments
                           WHERE booking_id = :booking_id
                           ORDER BY id DESC
                           LIMIT 1";

            $paymentStmt = $this->conn->prepare($paymentSql);
            $paymentStmt->bindValue(":booking_id", $bookingId, PDO::PARAM_INT);
            $paymentStmt->execute();

            $payment = $paymentStmt->fetch(PDO::FETCH_ASSOC);

            Response::success("Lấy chi tiết đơn đặt phòng thành công.", [
                "booking" => $booking,
                "services" => $services,
                "payment" => $payment ?: null
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy chi tiết đơn admin: " . $e->getMessage(), 500);
        }
    }

    public function confirm(string $id): void
    {
        try {
            AuthMiddleware::requireAdmin();

            $bookingId = (int) $id;
            $booking = $this->bookingModel->findById($bookingId);

            if (!$booking) {
                Response::error("Không tìm thấy đơn đặt phòng.", 404);
            }

            if ($booking["status"] !== "pending") {
                Response::error("Chỉ có thể xác nhận đơn đang chờ duyệt.");
            }

            $updated = $this->bookingModel->updateStatus($bookingId, "confirmed");

            if (!$updated) {
                Response::error("Xác nhận đơn đặt phòng thất bại.");
            }

            $existingInvoice = $this->invoiceModel->findByBookingId($bookingId);

            if (!$existingInvoice) {
                $invoiceCode = "INV" . date("YmdHis") . $bookingId;

                $this->invoiceModel->create(
                    $bookingId,
                    $invoiceCode,
                    (float) $booking["total_price"]
                );
            }

            Response::success("Xác nhận đơn đặt phòng và tạo hóa đơn thành công.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi xác nhận đơn: " . $e->getMessage(), 500);
        }
    }

    public function cancel(string $id): void
    {
        try {
            AuthMiddleware::requireAdmin();

            $bookingId = (int) $id;
            $booking = $this->bookingModel->findById($bookingId);

            if (!$booking) {
                Response::error("Không tìm thấy đơn đặt phòng.", 404);
            }

            if ($booking["status"] === "cancelled") {
                Response::error("Đơn đặt phòng này đã bị hủy trước đó.");
            }

            $updated = $this->bookingModel->updateStatus($bookingId, "cancelled");

            if (!$updated) {
                Response::error("Hủy đơn đặt phòng thất bại.");
            }

            Response::success("Hủy đơn đặt phòng thành công.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi hủy đơn: " . $e->getMessage(), 500);
        }
    }

    public function markPaid(string $id): void
    {
        try {
            AuthMiddleware::requireAdmin();

            $bookingId = (int) $id;
            $booking = $this->bookingModel->findById($bookingId);

            if (!$booking) {
                Response::error("Không tìm thấy đơn đặt phòng.", 404);
            }

            if ($booking["status"] !== "confirmed") {
                Response::error("Chỉ có thể thanh toán đơn đã được xác nhận.");
            }

            $invoice = $this->invoiceModel->findByBookingId($bookingId);

            if (!$invoice) {
                $invoiceCode = "INV" . date("YmdHis") . $bookingId;

                $this->invoiceModel->create(
                    $bookingId,
                    $invoiceCode,
                    (float) $booking["total_price"]
                );
            }

            $invoiceSql = "UPDATE invoices
                           SET payment_status = 'paid'
                           WHERE booking_id = :booking_id";

            $invoiceStmt = $this->conn->prepare($invoiceSql);
            $invoiceStmt->bindValue(":booking_id", $bookingId, PDO::PARAM_INT);
            $invoiceStmt->execute();

            $findPaymentSql = "SELECT id
                               FROM payments
                               WHERE booking_id = :booking_id
                               ORDER BY id DESC
                               LIMIT 1";

            $findPaymentStmt = $this->conn->prepare($findPaymentSql);
            $findPaymentStmt->bindValue(":booking_id", $bookingId, PDO::PARAM_INT);
            $findPaymentStmt->execute();

            $payment = $findPaymentStmt->fetch(PDO::FETCH_ASSOC);

            if ($payment) {
                $paymentId = (int) $payment["id"];

                $updatePaymentSql = "UPDATE payments
                                     SET payment_status = 'paid'
                                     WHERE id = :id";

                $updatePaymentStmt = $this->conn->prepare($updatePaymentSql);
                $updatePaymentStmt->bindValue(":id", $paymentId, PDO::PARAM_INT);
                $updatePaymentStmt->execute();
            } else {
                $insertPaymentSql = "INSERT INTO payments 
                                     (booking_id, amount, payment_method, payment_status)
                                     VALUES 
                                     (:booking_id, :amount, 'cash', 'paid')";

                $insertPaymentStmt = $this->conn->prepare($insertPaymentSql);
                $insertPaymentStmt->bindValue(":booking_id", $bookingId, PDO::PARAM_INT);
                $insertPaymentStmt->bindValue(":amount", (float) $booking["total_price"]);
                $insertPaymentStmt->execute();
            }

            Response::success("Cập nhật thanh toán thành công.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi cập nhật thanh toán: " . $e->getMessage(), 500);
        }
    }
}