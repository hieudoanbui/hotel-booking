<?php

namespace App\Models;

use PDO;

class RoomType
{
    private PDO $conn;
    private string $table = "room_types";

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function getAll(): array
    {
        $sql = "SELECT id, name, description, created_at
                FROM {$this->table}
                ORDER BY id DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT id, name, description, created_at
                FROM {$this->table}
                WHERE id = :id
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        $roomType = $stmt->fetch(PDO::FETCH_ASSOC);

        return $roomType ?: null;
    }

    public function create(array $data): bool
    {
        $sql = "INSERT INTO {$this->table}
                (name, description)
                VALUES
                (:name, :description)";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":name", $data["name"]);
        $stmt->bindParam(":description", $data["description"]);

        return $stmt->execute();
    }

    public function update(int $id, array $data): bool
    {
        $sql = "UPDATE {$this->table}
                SET name = :name,
                    description = :description
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->bindParam(":name", $data["name"]);
        $stmt->bindParam(":description", $data["description"]);

        return $stmt->execute();
    }

    public function hasRooms(int $id): bool
    {
        $sql = "SELECT COUNT(*)
                FROM rooms
                WHERE room_type_id = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        return (int) $stmt->fetchColumn() > 0;
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