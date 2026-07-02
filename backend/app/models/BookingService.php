<?php

namespace App\Models;

use PDO;

class BookingService
{
    private $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function getServiceById($serviceId)
    {
        $sql = "
            SELECT id, name, price, status
            FROM services
            WHERE id = :id AND status = 'active'
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $serviceId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function calculateTotalPrice($serviceIds)
    {
        if (empty($serviceIds) || !is_array($serviceIds)) {
            return 0;
        }

        $total = 0;

        foreach ($serviceIds as $serviceId) {
            $serviceId = (int) $serviceId;
            $service = $this->getServiceById($serviceId);

            if ($service) {
                $total += (float) $service["price"];
            }
        }

        return $total;
    }

    public function addServicesToBooking($bookingId, $serviceIds)
    {
        if (empty($serviceIds) || !is_array($serviceIds)) {
            return;
        }

        foreach ($serviceIds as $serviceId) {
            $serviceId = (int) $serviceId;
            $service = $this->getServiceById($serviceId);

            if (!$service) {
                continue;
            }

            $sql = "
                INSERT INTO booking_services 
                (booking_id, service_id, quantity, price)
                VALUES 
                (:booking_id, :service_id, :quantity, :price)
            ";

            $stmt = $this->conn->prepare($sql);

            $quantity = 1;
            $price = $service["price"];

            $stmt->bindParam(":booking_id", $bookingId, PDO::PARAM_INT);
            $stmt->bindParam(":service_id", $serviceId, PDO::PARAM_INT);
            $stmt->bindParam(":quantity", $quantity, PDO::PARAM_INT);
            $stmt->bindParam(":price", $price);

            $stmt->execute();
        }
    }

    public function getByBookingId($bookingId)
    {
        $sql = "
            SELECT
                bs.id,
                bs.booking_id,
                bs.service_id,
                bs.quantity,
                bs.price,
                s.name,
                s.description
            FROM booking_services bs
            INNER JOIN services s ON bs.service_id = s.id
            WHERE bs.booking_id = :booking_id
            ORDER BY bs.id ASC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":booking_id", $bookingId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}