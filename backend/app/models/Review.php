<?php

namespace App\Models;

use PDO;

class Review
{
    private PDO $conn;
    private string $table = "reviews";

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function getByRoomId(int $roomId): array
    {
        $sql = "SELECT 
                    r.id,
                    r.user_id,
                    r.room_id,
                    r.rating,
                    r.comment,
                    r.created_at,
                    u.name AS customer_name
                FROM {$this->table} r
                INNER JOIN users u ON u.id = r.user_id
                WHERE r.room_id = :room_id
                ORDER BY r.id DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":room_id", $roomId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllForAdmin(): array
    {
        $sql = "SELECT 
                    r.id,
                    r.user_id,
                    r.room_id,
                    r.rating,
                    r.comment,
                    r.created_at,
                    u.name AS customer_name,
                    u.email AS customer_email,
                    ro.room_number,
                    ro.title AS room_title
                FROM {$this->table} r
                INNER JOIN users u ON u.id = r.user_id
                INNER JOIN rooms ro ON ro.id = r.room_id
                ORDER BY r.id DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(array $data): bool
    {
        $sql = "INSERT INTO {$this->table}
                (user_id, room_id, rating, comment)
                VALUES
                (:user_id, :room_id, :rating, :comment)";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":user_id", $data["user_id"], PDO::PARAM_INT);
        $stmt->bindParam(":room_id", $data["room_id"], PDO::PARAM_INT);
        $stmt->bindParam(":rating", $data["rating"], PDO::PARAM_INT);
        $stmt->bindParam(":comment", $data["comment"]);

        return $stmt->execute();
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

        $review = $stmt->fetch(PDO::FETCH_ASSOC);

        return $review ?: null;
    }

    public function delete(int $id): bool
    {
        $sql = "DELETE FROM {$this->table}
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);

        return $stmt->execute();
    }
}