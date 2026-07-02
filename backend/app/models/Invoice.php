<?php

namespace App\Models;

use PDO;

class Invoice
{
    private PDO $conn;
    private string $table = "invoices";

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function findByBookingId(int $bookingId): ?array
    {
        $sql = "SELECT * FROM {$this->table}
                WHERE booking_id = :booking_id
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":booking_id", $bookingId, PDO::PARAM_INT);
        $stmt->execute();

        $invoice = $stmt->fetch(PDO::FETCH_ASSOC);

        return $invoice ?: null;
    }

    public function create(int $bookingId, string $invoiceCode, float $amount): bool
    {
        $sql = "INSERT INTO {$this->table}
                (booking_id, invoice_code, amount, payment_status)
                VALUES
                (:booking_id, :invoice_code, :amount, 'unpaid')";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":booking_id", $bookingId, PDO::PARAM_INT);
        $stmt->bindParam(":invoice_code", $invoiceCode);
        $stmt->bindParam(":amount", $amount);

        return $stmt->execute();
    }

    public function getAll(): array
    {
        $sql = "SELECT 
                    invoices.id,
                    invoices.invoice_code,
                    invoices.amount,
                    invoices.payment_status,
                    invoices.created_at,
                    bookings.check_in,
                    bookings.check_out,
                    users.name AS customer_name,
                    users.email AS customer_email,
                    rooms.room_number,
                    rooms.title AS room_title
                FROM {$this->table}
                INNER JOIN bookings ON invoices.booking_id = bookings.id
                INNER JOIN users ON bookings.user_id = users.id
                INNER JOIN rooms ON bookings.room_id = rooms.id
                ORDER BY invoices.id DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function markAsPaid(int $invoiceId): bool
    {
        $sql = "UPDATE {$this->table}
                SET payment_status = 'paid'
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $invoiceId, PDO::PARAM_INT);

        return $stmt->execute();
    }
}