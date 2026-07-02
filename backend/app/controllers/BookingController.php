<?php

namespace App\Controllers;

use PDO;
use Throwable;
use DateTime;
use App\Models\Room;
use App\Models\Booking;
use App\Models\BookingService;
use App\Models\Payment;
use App\Models\Promotion;
use App\Helpers\Request;
use App\Helpers\Response;
use App\Middlewares\AuthMiddleware;

class BookingController
{
    private PDO $conn;
    private Booking $bookingModel;
    private Room $roomModel;
    private BookingService $bookingServiceModel;
    private Payment $paymentModel;
    private Promotion $promotionModel;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
        $this->bookingModel = new Booking($db);
        $this->roomModel = new Room($db);
        $this->bookingServiceModel = new BookingService($db);
        $this->paymentModel = new Payment($db);
        $this->promotionModel = new Promotion($db);
    }

    private function isValidDate(string $date): bool
    {
        $dateTime = DateTime::createFromFormat("Y-m-d", $date);

        return $dateTime && $dateTime->format("Y-m-d") === $date;
    }

    private function calculateNights(string $checkIn, string $checkOut): int
    {
        $start = new DateTime($checkIn);
        $end = new DateTime($checkOut);

        return (int) $start->diff($end)->days;
    }

    private function normalizeServiceIds($serviceIds): array
    {
        if (!is_array($serviceIds)) {
            return [];
        }

        $result = [];

        foreach ($serviceIds as $serviceId) {
            $serviceId = (int) $serviceId;

            if ($serviceId > 0 && !in_array($serviceId, $result)) {
                $result[] = $serviceId;
            }
        }

        return $result;
    }

    public function checkAvailability(): void
    {
        $data = Request::input();

        $roomId = (int) ($data["room_id"] ?? 0);
        $checkIn = trim($data["check_in"] ?? "");
        $checkOut = trim($data["check_out"] ?? "");

        if ($roomId <= 0 || $checkIn === "" || $checkOut === "") {
            Response::error("Vui lòng chọn phòng, ngày nhận phòng và ngày trả phòng.");
        }

        if (!$this->isValidDate($checkIn) || !$this->isValidDate($checkOut)) {
            Response::error("Định dạng ngày không hợp lệ. Vui lòng nhập theo dạng YYYY-MM-DD.");
        }

        if ($checkOut <= $checkIn) {
            Response::error("Ngày trả phòng phải sau ngày nhận phòng.");
        }

        $room = $this->roomModel->findById($roomId);

        if (!$room) {
            Response::error("Không tìm thấy phòng.", 404);
        }

        if ($room["status"] !== "active") {
            Response::error("Phòng hiện đang bảo trì, không thể đặt.");
        }

        $available = $this->bookingModel->isRoomAvailable($roomId, $checkIn, $checkOut);

        if (!$available) {
            Response::success("Phòng không còn trống trong khoảng thời gian này.", [
                "available" => false
            ]);
        }

        Response::success("Phòng còn trống, có thể đặt.", [
            "available" => true
        ]);
    }

    public function store(): void
    {
        AuthMiddleware::requireLogin();

        $data = Request::input();

        $userId = (int) $_SESSION["user_id"];
        $roomId = (int) ($data["room_id"] ?? 0);
        $checkIn = trim($data["check_in"] ?? "");
        $checkOut = trim($data["check_out"] ?? "");
        $note = trim($data["note"] ?? "");
        $serviceIds = $this->normalizeServiceIds($data["service_ids"] ?? []);

        $promotionCodeInput = strtoupper(trim($data["promotion_code"] ?? ""));
        $promotionCode = null;
        $discountAmount = 0;

        if ($roomId <= 0 || $checkIn === "" || $checkOut === "") {
            Response::error("Vui lòng nhập đầy đủ thông tin đặt phòng.");
        }

        if (!$this->isValidDate($checkIn) || !$this->isValidDate($checkOut)) {
            Response::error("Định dạng ngày không hợp lệ. Vui lòng nhập theo dạng YYYY-MM-DD.");
        }

        if ($checkOut <= $checkIn) {
            Response::error("Ngày trả phòng phải sau ngày nhận phòng.");
        }

        $today = date("Y-m-d");

        if ($checkIn < $today) {
            Response::error("Ngày nhận phòng không được nhỏ hơn ngày hiện tại.");
        }

        $room = $this->roomModel->findById($roomId);

        if (!$room) {
            Response::error("Không tìm thấy phòng.", 404);
        }

        if ($room["status"] !== "active") {
            Response::error("Phòng hiện đang bảo trì, không thể đặt.");
        }

        $available = $this->bookingModel->isRoomAvailable($roomId, $checkIn, $checkOut);

        if (!$available) {
            Response::error("Phòng đã có người đặt trong khoảng thời gian này.");
        }

        $nights = $this->calculateNights($checkIn, $checkOut);
        $roomPrice = $nights * (float) $room["price"];
        $servicePrice = $this->bookingServiceModel->calculateTotalPrice($serviceIds);

        $beforeDiscount = $roomPrice + $servicePrice;

        if ($promotionCodeInput !== "") {
            $promotion = $this->promotionModel->findActiveByCode($promotionCodeInput);

            if (!$promotion) {
                Response::error("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
            }

            $promotionCode = $promotion["code"];
            $discountAmount = $this->promotionModel->calculateDiscount($promotion, $beforeDiscount);
        }

        $totalPrice = $beforeDiscount - $discountAmount;

        if ($totalPrice < 0) {
            $totalPrice = 0;
        }

        $created = $this->bookingModel->create([
            "user_id" => $userId,
            "room_id" => $roomId,
            "check_in" => $checkIn,
            "check_out" => $checkOut,
            "total_price" => $totalPrice,
            "note" => $note,
            "promotion_code" => $promotionCode,
            "discount_amount" => $discountAmount
        ]);

        if (!$created) {
            Response::error("Đặt phòng thất bại.");
        }

        $bookingId = (int) $this->conn->lastInsertId();

        if ($bookingId > 0) {
            $this->bookingServiceModel->addServicesToBooking($bookingId, $serviceIds);
            $this->paymentModel->createPendingPayment($bookingId, $totalPrice, "cash");
        }

        Response::success("Đặt phòng thành công. Vui lòng chờ admin xác nhận.", [
            "booking_id" => $bookingId,
            "room_price" => $roomPrice,
            "service_price" => $servicePrice,
            "before_discount" => $beforeDiscount,
            "promotion_code" => $promotionCode,
            "discount_amount" => $discountAmount,
            "total_price" => $totalPrice,
            "nights" => $nights,
            "service_ids" => $serviceIds,
            "payment_status" => "pending"
        ], 201);
    }

    public function myBookings(): void
    {
        AuthMiddleware::requireLogin();

        $userId = (int) $_SESSION["user_id"];
        $bookings = $this->bookingModel->getByUserId($userId);

        Response::success("Lấy lịch sử đặt phòng thành công.", [
            "bookings" => $bookings
        ]);
    }

    public function showMyBooking(string $id): void
    {
        try {
            AuthMiddleware::requireLogin();

            $bookingId = (int) $id;
            $userId = (int) $_SESSION["user_id"];

            $sql = "SELECT 
                        b.*,
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
                    LEFT JOIN rooms r ON b.room_id = r.id
                    LEFT JOIN room_types rt ON r.room_type_id = rt.id
                    LEFT JOIN invoices i ON i.booking_id = b.id
                    WHERE b.id = :id
                    AND b.user_id = :user_id
                    LIMIT 1";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":id", $bookingId, PDO::PARAM_INT);
            $stmt->bindParam(":user_id", $userId, PDO::PARAM_INT);
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
            $serviceStmt->bindParam(":booking_id", $bookingId, PDO::PARAM_INT);
            $serviceStmt->execute();

            $services = $serviceStmt->fetchAll(PDO::FETCH_ASSOC);

            Response::success("Lấy chi tiết đơn đặt phòng thành công.", [
                "booking" => $booking,
                "services" => $services
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy chi tiết đơn: " . $e->getMessage(), 500);
        }
    }

    public function cancel(string $id): void
    {
        AuthMiddleware::requireLogin();

        $bookingId = (int) $id;
        $userId = (int) $_SESSION["user_id"];

        $booking = $this->bookingModel->findById($bookingId);

        if (!$booking) {
            Response::error("Không tìm thấy đơn đặt phòng.", 404);
        }

        if ((int) $booking["user_id"] !== $userId) {
            Response::error("Bạn không có quyền hủy đơn đặt phòng này.", 403);
        }

        if ($booking["status"] !== "pending") {
            Response::error("Chỉ có thể hủy đơn đang chờ xác nhận.");
        }

        $cancelled = $this->bookingModel->cancelByCustomer($bookingId, $userId);

        if (!$cancelled) {
            Response::error("Hủy đặt phòng thất bại.");
        }

        Response::success("Hủy đặt phòng thành công.");
    }

    public function confirmPayment(string $id): void
    {
        AuthMiddleware::requireLogin();

        $bookingId = (int) $id;
        $userId = (int) $_SESSION["user_id"];

        $booking = $this->bookingModel->findById($bookingId);

        if (!$booking) {
            Response::error("Không tìm thấy đơn đặt phòng.", 404);
        }

        if ((int) $booking["user_id"] !== $userId) {
            Response::error("Bạn không có quyền thực hiện thao tác này.", 403);
        }

        if ($booking["status"] === "cancelled") {
            Response::error("Đơn đặt phòng đã bị hủy.");
        }

        $paidSql = "SELECT id FROM payments WHERE booking_id = :booking_id AND payment_status = 'paid' LIMIT 1";
        $paidStmt = $this->conn->prepare($paidSql);
        $paidStmt->bindParam(":booking_id", $bookingId, PDO::PARAM_INT);
        $paidStmt->execute();

        $paidPayment = $paidStmt->fetch(PDO::FETCH_ASSOC);

        if ($paidPayment) {
            Response::success("Đơn đặt phòng đã được thanh toán.");
        }

        $paymentSql = "SELECT id FROM payments WHERE booking_id = :booking_id ORDER BY id DESC LIMIT 1";
        $paymentStmt = $this->conn->prepare($paymentSql);
        $paymentStmt->bindParam(":booking_id", $bookingId, PDO::PARAM_INT);
        $paymentStmt->execute();

        $payment = $paymentStmt->fetch(PDO::FETCH_ASSOC);

        if ($payment) {
            $updateSql = "UPDATE payments SET payment_status = 'pending' WHERE id = :id";
            $updateStmt = $this->conn->prepare($updateSql);
            $updateStmt->bindParam(":id", $payment["id"], PDO::PARAM_INT);
            $updated = $updateStmt->execute();
        } else {
            $insertSql = "INSERT INTO payments (booking_id, amount, payment_method, payment_status) VALUES (:booking_id, :amount, 'cash', 'pending')";
            $insertStmt = $this->conn->prepare($insertSql);
            $insertStmt->bindParam(":booking_id", $bookingId, PDO::PARAM_INT);
            $insertStmt->bindParam(":amount", $booking["total_price"]);
            $updated = $insertStmt->execute();
        }

        if (!$updated) {
            Response::error("Gửi yêu cầu thanh toán thất bại. Vui lòng thử lại.");
        }

        Response::success("Yêu cầu thanh toán đã được gửi. Vui lòng chờ quản trị viên xác nhận.");
    }
}