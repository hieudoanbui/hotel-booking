<?php

namespace App\Models;

use PDO;

class Promotion
{
    private PDO $conn;
    private string $table = "promotions";

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function getAll(): array
    {
        $sql = "SELECT id, code, name, discount_type, discount_value, start_date, end_date, status, created_at
                FROM {$this->table}
                ORDER BY id DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT id, code, name, discount_type, discount_value, start_date, end_date, status, created_at
                FROM {$this->table}
                WHERE id = :id
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        $promotion = $stmt->fetch(PDO::FETCH_ASSOC);

        return $promotion ?: null;
    }

    public function findByCode(string $code): ?array
    {
        $sql = "SELECT *
                FROM {$this->table}
                WHERE code = :code
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":code", $code);
        $stmt->execute();

        $promotion = $stmt->fetch(PDO::FETCH_ASSOC);

        return $promotion ?: null;
    }

    public function findActiveByCode(string $code): ?array
    {
        $today = date("Y-m-d");

        $sql = "SELECT *
                FROM {$this->table}
                WHERE code = :code
                AND status = 'active'
                AND (start_date IS NULL OR start_date <= :today)
                AND (end_date IS NULL OR end_date >= :today)
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":code", $code);
        $stmt->bindParam(":today", $today);
        $stmt->execute();

        $promotion = $stmt->fetch(PDO::FETCH_ASSOC);

        return $promotion ?: null;
    }

    public function calculateDiscount(array $promotion, float $amount): float
    {
        $discountType = $promotion["discount_type"];
        $discountValue = (float) $promotion["discount_value"];

        if ($discountType === "percent") {
            $discount = $amount * $discountValue / 100;
        } else {
            $discount = $discountValue;
        }

        if ($discount > $amount) {
            $discount = $amount;
        }

        return $discount;
    }

    public function create(array $data): bool
    {
        $sql = "INSERT INTO {$this->table}
                (code, name, discount_type, discount_value, start_date, end_date, status)
                VALUES
                (:code, :name, :discount_type, :discount_value, :start_date, :end_date, :status)";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":code", $data["code"]);
        $stmt->bindParam(":name", $data["name"]);
        $stmt->bindParam(":discount_type", $data["discount_type"]);
        $stmt->bindParam(":discount_value", $data["discount_value"]);
        $stmt->bindParam(":start_date", $data["start_date"]);
        $stmt->bindParam(":end_date", $data["end_date"]);
        $stmt->bindParam(":status", $data["status"]);

        return $stmt->execute();
    }

    public function update(int $id, array $data): bool
    {
        $sql = "UPDATE {$this->table}
                SET code = :code,
                    name = :name,
                    discount_type = :discount_type,
                    discount_value = :discount_value,
                    start_date = :start_date,
                    end_date = :end_date,
                    status = :status
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->bindParam(":code", $data["code"]);
        $stmt->bindParam(":name", $data["name"]);
        $stmt->bindParam(":discount_type", $data["discount_type"]);
        $stmt->bindParam(":discount_value", $data["discount_value"]);
        $stmt->bindParam(":start_date", $data["start_date"]);
        $stmt->bindParam(":end_date", $data["end_date"]);
        $stmt->bindParam(":status", $data["status"]);

        return $stmt->execute();
    }

    public function hide(int $id): bool
    {
        $status = "inactive";

        $sql = "UPDATE {$this->table}
                SET status = :status
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->bindParam(":status", $status);

        return $stmt->execute();
    }
}