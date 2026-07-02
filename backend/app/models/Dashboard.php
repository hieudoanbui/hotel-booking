<?php

namespace App\Models;

use PDO;

class Dashboard
{
    private $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    private function getCount($sql)
    {
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return (int) $stmt->fetchColumn();
    }

    private function getSum($sql)
    {
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return (float) $stmt->fetchColumn();
    }

    public function getStats()
    {
        return [
            "total_customers" => $this->getCount("
                SELECT COUNT(*) 
                FROM users 
                WHERE role = 'customer'
            "),

            "total_rooms" => $this->getCount("
                SELECT COUNT(*) 
                FROM rooms
            "),

            "total_bookings" => $this->getCount("
                SELECT COUNT(*) 
                FROM bookings
            "),

            "pending_bookings" => $this->getCount("
                SELECT COUNT(*) 
                FROM bookings 
                WHERE status = 'pending'
            "),

            "confirmed_bookings" => $this->getCount("
                SELECT COUNT(*) 
                FROM bookings 
                WHERE status = 'confirmed'
            "),

            "cancelled_bookings" => $this->getCount("
                SELECT COUNT(*) 
                FROM bookings 
                WHERE status = 'cancelled'
            "),

            "total_invoices" => $this->getCount("
                SELECT COUNT(*) 
                FROM invoices
            "),

            "total_services" => $this->getCount("
                SELECT COUNT(*) 
                FROM services
            "),

            "total_reviews" => $this->getCount("
                SELECT COUNT(*) 
                FROM reviews
            "),

            "total_promotions" => $this->getCount("
                SELECT COUNT(*) 
                FROM promotions
            "),

            "pending_payments" => $this->getCount("
                SELECT COUNT(*) 
                FROM payments 
                WHERE payment_status = 'pending'
            "),

            "paid_payments" => $this->getCount("
                SELECT COUNT(*) 
                FROM payments 
                WHERE payment_status = 'paid'
            "),

            "expected_revenue" => $this->getSum("
                SELECT COALESCE(SUM(total_price), 0) 
                FROM bookings 
                WHERE status = 'confirmed'
            "),

            "paid_revenue" => $this->getSum("
                SELECT COALESCE(SUM(amount), 0) 
                FROM payments 
                WHERE payment_status = 'paid'
            "),

            "pending_payment_amount" => $this->getSum("
                SELECT COALESCE(SUM(amount), 0) 
                FROM payments 
                WHERE payment_status = 'pending'
            "),

            "total_discount" => $this->getSum("
                SELECT COALESCE(SUM(discount_amount), 0) 
                FROM bookings
            ")
        ];
    }
}