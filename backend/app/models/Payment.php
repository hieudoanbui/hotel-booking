<?php

namespace App\Models;

use PDO;

class Payment
{
    private $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function createPendingPayment($bookingId, $amount, $paymentMethod = "cash")
    {
        $sql = "
            INSERT INTO payments 
            (booking_id, payment_method, amount, payment_status)
            VALUES 
            (:booking_id, :payment_method, :amount, :payment_status)
        ";

        $stmt = $this->conn->prepare($sql);

        $status = "pending";

        $stmt->bindParam(":booking_id", $bookingId, PDO::PARAM_INT);
        $stmt->bindParam(":payment_method", $paymentMethod);
        $stmt->bindParam(":amount", $amount);
        $stmt->bindParam(":payment_status", $status);

        return $stmt->execute();
    }

    public function getAll()
    {
        $sql = "
            SELECT 
                p.id,
                p.booking_id,
                p.payment_method,
                p.amount,
                p.payment_status,
                p.paid_at,
                p.created_at,
                b.check_in,
                b.check_out,
                b.status AS booking_status,
                u.name AS customer_name,
                u.email AS customer_email,
                r.room_number,
                r.title AS room_title
            FROM payments p
            INNER JOIN bookings b ON p.booking_id = b.id
            INNER JOIN users u ON b.user_id = u.id
            INNER JOIN rooms r ON b.room_id = r.id
            ORDER BY p.id DESC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function markAsPaid($id)
    {
        $sql = "
            UPDATE payments
            SET payment_status = 'paid',
                paid_at = NOW()
            WHERE id = :id
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);

        return $stmt->execute();
    }
}