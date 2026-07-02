<?php

namespace App\Controllers;

use PDO;
use Throwable;
use App\Models\BookingService;
use App\Helpers\Response;
use App\Middlewares\AuthMiddleware;

class BookingServiceController
{
    private $bookingServiceModel;

    public function __construct(PDO $db)
    {
        $this->bookingServiceModel = new BookingService($db);
    }

    public function getByBooking($bookingId)
    {
        AuthMiddleware::requireLogin();

        try {
            $bookingId = (int) $bookingId;

            if ($bookingId <= 0) {
                Response::error("Mã đơn đặt phòng không hợp lệ.");
            }

            $services = $this->bookingServiceModel->getByBookingId($bookingId);

            Response::success("Lấy dịch vụ của đơn đặt phòng thành công.", [
                "services" => $services
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy dịch vụ của đơn đặt phòng: " . $e->getMessage(), 500);
        }
    }
}