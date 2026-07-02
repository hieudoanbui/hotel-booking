<?php

namespace App\Models;

use PDO;

class Room
{
    private PDO $conn;
    private string $table = "rooms";

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function getAll(): array
    {
        $sql = "SELECT 
                    rooms.id,
                    rooms.room_type_id,
                    rooms.room_number,
                    rooms.title,
                    rooms.description,
                    rooms.price,
                    rooms.capacity,
                    rooms.image,
                    rooms.status,
                    room_types.name AS room_type
                FROM {$this->table}
                INNER JOIN room_types ON rooms.room_type_id = room_types.id
                ORDER BY rooms.id DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT 
                    rooms.id,
                    rooms.room_type_id,
                    rooms.room_number,
                    rooms.title,
                    rooms.description,
                    rooms.price,
                    rooms.capacity,
                    rooms.image,
                    rooms.status,
                    room_types.name AS room_type
                FROM {$this->table}
                INNER JOIN room_types ON rooms.room_type_id = room_types.id
                WHERE rooms.id = :id
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        $room = $stmt->fetch(PDO::FETCH_ASSOC);

        return $room ?: null;
    }

    public function findByRoomNumber(string $roomNumber, ?int $excludeId = null): ?array
    {
        if ($excludeId === null) {
            $sql = "SELECT * FROM {$this->table} 
                    WHERE room_number = :room_number 
                    LIMIT 1";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":room_number", $roomNumber);
        } else {
            $sql = "SELECT * FROM {$this->table} 
                    WHERE room_number = :room_number 
                    AND id != :id
                    LIMIT 1";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":room_number", $roomNumber);
            $stmt->bindParam(":id", $excludeId, PDO::PARAM_INT);
        }

        $stmt->execute();

        $room = $stmt->fetch(PDO::FETCH_ASSOC);

        return $room ?: null;
    }

    public function create(array $data): bool
    {
        $sql = "INSERT INTO {$this->table} 
                (room_type_id, room_number, title, description, price, capacity, image, status)
                VALUES
                (:room_type_id, :room_number, :title, :description, :price, :capacity, :image, :status)";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":room_type_id", $data["room_type_id"], PDO::PARAM_INT);
        $stmt->bindParam(":room_number", $data["room_number"]);
        $stmt->bindParam(":title", $data["title"]);
        $stmt->bindParam(":description", $data["description"]);
        $stmt->bindParam(":price", $data["price"]);
        $stmt->bindParam(":capacity", $data["capacity"], PDO::PARAM_INT);
        $stmt->bindParam(":image", $data["image"]);
        $stmt->bindParam(":status", $data["status"]);

        return $stmt->execute();
    }

    public function update(int $id, array $data): bool
    {
        $sql = "UPDATE {$this->table}
                SET 
                    room_type_id = :room_type_id,
                    room_number = :room_number,
                    title = :title,
                    description = :description,
                    price = :price,
                    capacity = :capacity,
                    image = :image,
                    status = :status
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":room_type_id", $data["room_type_id"], PDO::PARAM_INT);
        $stmt->bindParam(":room_number", $data["room_number"]);
        $stmt->bindParam(":title", $data["title"]);
        $stmt->bindParam(":description", $data["description"]);
        $stmt->bindParam(":price", $data["price"]);
        $stmt->bindParam(":capacity", $data["capacity"], PDO::PARAM_INT);
        $stmt->bindParam(":image", $data["image"]);
        $stmt->bindParam(":status", $data["status"]);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    public function delete(int $id): bool
    {
        $sql = "DELETE FROM {$this->table} WHERE id = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);

        return $stmt->execute();
    }
}