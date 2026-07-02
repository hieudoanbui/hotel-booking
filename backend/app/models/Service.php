<?php

namespace App\Models;

use PDO;

class Service
{
    private PDO $conn;
    private string $table = "services";

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function getActive(): array
    {
        $sql = "SELECT id, name, description, price, status, created_at
                FROM {$this->table}
                WHERE status = 'active'
                ORDER BY id DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAll(): array
    {
        $sql = "SELECT id, name, description, price, status, created_at
                FROM {$this->table}
                ORDER BY id DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT id, name, description, price, status, created_at
                FROM {$this->table}
                WHERE id = :id
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        $service = $stmt->fetch(PDO::FETCH_ASSOC);

        return $service ?: null;
    }

    public function create(array $data): bool
    {
        $sql = "INSERT INTO {$this->table}
                (name, description, price, status)
                VALUES
                (:name, :description, :price, :status)";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":name", $data["name"]);
        $stmt->bindParam(":description", $data["description"]);
        $stmt->bindParam(":price", $data["price"]);
        $stmt->bindParam(":status", $data["status"]);

        return $stmt->execute();
    }

    public function update(int $id, array $data): bool
    {
        $sql = "UPDATE {$this->table}
                SET name = :name,
                    description = :description,
                    price = :price,
                    status = :status
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->bindParam(":name", $data["name"]);
        $stmt->bindParam(":description", $data["description"]);
        $stmt->bindParam(":price", $data["price"]);
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