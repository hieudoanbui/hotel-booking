<?php

namespace App\Models;

use PDO;

class Booking
{
    private PDO $conn;
    private string $table = "bookings";

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function isRoomAvailable(int $roomId, string $checkIn, string $checkOut): bool
    {
        $sql = "SELECT COUNT(*) AS total
                FROM {$this->table}
                WHERE room_id = :room_id
                AND status IN ('pending', 'confirmed')
                AND check_in < :check_out
                AND check_out > :check_in";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":room_id", $roomId, PDO::PARAM_INT);
        $stmt->bindParam(":check_in", $checkIn);
        $stmt->bindParam(":check_out", $checkOut);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return (int) $result["total"] === 0;
    }

    public function create(array $data): bool
    {
        $sql = "INSERT INTO {$this->table}
                (
                    user_id,
                    room_id,
                    check_in,
                    check_out,
                    total_price,
                    status,
                    note,
                    promotion_code,
                    discount_amount
                )
                VALUES
                (
                    :user_id,
                    :room_id,
                    :check_in,
                    :check_out,
                    :total_price,
                    :status,
                    :note,
                    :promotion_code,
                    :discount_amount
                )";

        $stmt = $this->conn->prepare($sql);

        $status = "pending";
        $note = $data["note"] ?? "";
        $promotionCode = $data["promotion_code"] ?? null;
        $discountAmount = $data["discount_amount"] ?? 0;

        $stmt->bindParam(":user_id", $data["user_id"], PDO::PARAM_INT);
        $stmt->bindParam(":room_id", $data["room_id"], PDO::PARAM_INT);
        $stmt->bindParam(":check_in", $data["check_in"]);
        $stmt->bindParam(":check_out", $data["check_out"]);
        $stmt->bindParam(":total_price", $data["total_price"]);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":note", $note);
        $stmt->bindParam(":promotion_code", $promotionCode);
        $stmt->bindParam(":discount_amount", $discountAmount);
        return $stmt->execute();
    }
    public function getByUserId(int $userId): array
    {
        $sql = "SELECT
                    b.id,
                    b.check_in,
                    b.check_out,
                    b.total_price,
                    b.status,
                    b.note,
                    b.promotion_code,
                    b.discount_amount,
                    b.created_at,

                    r.room_number,
                    r.title AS room_title,
                    r.image,

                    rt.name AS room_type,

                    i.invoice_code,

                    CASE
                        WHEN paid_payment.id IS NOT NULL THEN 'paid'
                        WHEN i.payment_status = 'paid' THEN 'paid'
                        ELSE 'unpaid'
                    END AS invoice_status,

                    CASE
                        WHEN paid_payment.id IS NOT NULL THEN 'paid'
                        WHEN i.payment_status = 'paid' THEN 'paid'
                        ELSE 'unpaid'
                    END AS payment_status,

                    paid_payment.payment_method

                FROM {$this->table} b

                INNER JOIN rooms r
                    ON b.room_id = r.id

                INNER JOIN room_types rt
                    ON r.room_type_id = rt.id

                LEFT JOIN invoices i
                    ON i.booking_id = b.id

                LEFT JOIN (
                    SELECT p1.*
                    FROM payments p1
                    INNER JOIN (
                        SELECT booking_id, MAX(id) AS max_id
                        FROM payments
                        WHERE payment_status = 'paid'
                        GROUP BY booking_id
                    ) latest_paid
                        ON p1.id = latest_paid.max_id
                ) paid_payment
                    ON paid_payment.booking_id = b.id

                WHERE b.user_id = :user_id

                ORDER BY b.id DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":user_id", $userId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllForAdmin(): array
    {
        $sql = "SELECT
                    b.id,
                    b.user_id,
                    b.room_id,
                    b.check_in,
                    b.check_out,
                    b.total_price,
                    b.status,
                    b.note,
                    b.promotion_code,
                    b.discount_amount,
                    b.created_at,

                    u.name AS customer_name,
                    u.email AS customer_email,
                    u.phone AS customer_phone,

                    r.room_number,
                    r.title AS room_title,
                    r.price AS room_price,

                    rt.name AS room_type,

                    i.invoice_code,

                    CASE
                        WHEN paid_payment.id IS NOT NULL THEN 'paid'
                        WHEN i.payment_status = 'paid' THEN 'paid'
                        ELSE 'unpaid'
                    END AS invoice_status,

                    CASE
                        WHEN paid_payment.id IS NOT NULL THEN 'paid'
                        WHEN i.payment_status = 'paid' THEN 'paid'
                        ELSE 'unpaid'
                    END AS payment_status,

                    paid_payment.payment_method

                FROM {$this->table} b

                LEFT JOIN users u
                    ON b.user_id = u.id

                LEFT JOIN rooms r
                    ON b.room_id = r.id

                LEFT JOIN room_types rt
                    ON r.room_type_id = rt.id

                LEFT JOIN invoices i
                    ON i.booking_id = b.id

                LEFT JOIN (
                    SELECT p1.*
                    FROM payments p1
                    INNER JOIN (
                        SELECT booking_id, MAX(id) AS max_id
                        FROM payments
                        WHERE payment_status = 'paid'
                        GROUP BY booking_id
                    ) latest_paid
                        ON p1.id = latest_paid.max_id
                ) paid_payment
                    ON paid_payment.booking_id = b.id

                ORDER BY b.id DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT *
                FROM {$this->table}
                WHERE id = :id
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        $booking = $stmt->fetch(PDO::FETCH_ASSOC);

        return $booking ?: null;
    }

    public function updateStatus(int $bookingId, string $status): bool
    {
        $sql = "UPDATE {$this->table}
                SET status = :status
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $bookingId, PDO::PARAM_INT);

        return $stmt->execute();
    }

    public function cancelByCustomer(int $bookingId, int $userId): bool
    {
        $sql = "UPDATE {$this->table}
                SET status = 'cancelled'
                WHERE id = :id
                AND user_id = :user_id
                AND status = 'pending'";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $bookingId, PDO::PARAM_INT);
        $stmt->bindParam(":user_id", $userId, PDO::PARAM_INT);

        return $stmt->execute();
    }
}