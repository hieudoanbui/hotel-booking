<?php

namespace App\Models;

use PDO;

class RoomImage
{
    private PDO $conn;
    private string $table = "room_images";

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function getByRoomId(int $roomId): array
    {
        $sql = "SELECT id, room_id, image_url, is_main, created_at
                FROM {$this->table}
                WHERE room_id = :room_id
                ORDER BY is_main DESC, id ASC";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":room_id", $roomId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllForAdmin(): array
    {
        $sql = "SELECT 
                    ri.id,
                    ri.room_id,
                    ri.image_url,
                    ri.is_main,
                    ri.created_at,
                    r.room_number,
                    r.title AS room_title
                FROM {$this->table} ri
                INNER JOIN rooms r ON r.id = ri.room_id
                ORDER BY ri.room_id ASC, ri.is_main DESC, ri.id ASC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT id, room_id, image_url, is_main, created_at
                FROM {$this->table}
                WHERE id = :id
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        $image = $stmt->fetch(PDO::FETCH_ASSOC);

        return $image ?: null;
    }

    public function create(array $data): bool
    {
        if ((int) $data["is_main"] === 1) {
            $this->clearMainImage((int) $data["room_id"]);
        }

        $sql = "INSERT INTO {$this->table}
                (room_id, image_url, is_main)
                VALUES
                (:room_id, :image_url, :is_main)";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":room_id", $data["room_id"], PDO::PARAM_INT);
        $stmt->bindParam(":image_url", $data["image_url"]);
        $stmt->bindParam(":is_main", $data["is_main"], PDO::PARAM_INT);

        return $stmt->execute();
    }

    public function update(int $id, array $data): bool
    {
        if ((int) $data["is_main"] === 1) {
            $this->clearMainImage((int) $data["room_id"]);
        }

        $sql = "UPDATE {$this->table}
                SET room_id = :room_id,
                    image_url = :image_url,
                    is_main = :is_main
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->bindParam(":room_id", $data["room_id"], PDO::PARAM_INT);
        $stmt->bindParam(":image_url", $data["image_url"]);
        $stmt->bindParam(":is_main", $data["is_main"], PDO::PARAM_INT);

        return $stmt->execute();
    }

    public function delete(int $id): bool
    {
        $sql = "DELETE FROM {$this->table}
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    public function clearMainImage(int $roomId): bool
    {
        $sql = "UPDATE {$this->table}
                SET is_main = 0
                WHERE room_id = :room_id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":room_id", $roomId, PDO::PARAM_INT);

        return $stmt->execute();
    }
}