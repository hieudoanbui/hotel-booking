<?php

namespace App\Models;

use PDO;

class Amenity
{
    private PDO $conn;
    private string $table = "amenities";

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function getAll(): array
    {
        $sql = "SELECT id, name, icon, description, created_at
                FROM {$this->table}
                ORDER BY id DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT id, name, icon, description, created_at
                FROM {$this->table}
                WHERE id = :id
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        $amenity = $stmt->fetch(PDO::FETCH_ASSOC);

        return $amenity ?: null;
    }

    public function getByRoomId(int $roomId): array
    {
        $sql = "SELECT a.id, a.name, a.icon, a.description
                FROM amenities a
                INNER JOIN room_amenities ra ON ra.amenity_id = a.id
                WHERE ra.room_id = :room_id
                ORDER BY a.id ASC";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":room_id", $roomId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAmenityIdsByRoomId(int $roomId): array
    {
        $sql = "SELECT amenity_id
                FROM room_amenities
                WHERE room_id = :room_id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":room_id", $roomId, PDO::PARAM_INT);
        $stmt->execute();

        return array_map("intval", $stmt->fetchAll(PDO::FETCH_COLUMN));
    }

    public function create(array $data): bool
    {
        $sql = "INSERT INTO {$this->table}
                (name, icon, description)
                VALUES
                (:name, :icon, :description)";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":name", $data["name"]);
        $stmt->bindParam(":icon", $data["icon"]);
        $stmt->bindParam(":description", $data["description"]);

        return $stmt->execute();
    }

    public function update(int $id, array $data): bool
    {
        $sql = "UPDATE {$this->table}
                SET name = :name,
                    icon = :icon,
                    description = :description
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->bindParam(":name", $data["name"]);
        $stmt->bindParam(":icon", $data["icon"]);
        $stmt->bindParam(":description", $data["description"]);

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

    public function updateRoomAmenities(int $roomId, array $amenityIds): bool
    {
        $this->conn->beginTransaction();

        try {
            $deleteSql = "DELETE FROM room_amenities
                          WHERE room_id = :room_id";

            $deleteStmt = $this->conn->prepare($deleteSql);
            $deleteStmt->bindParam(":room_id", $roomId, PDO::PARAM_INT);
            $deleteStmt->execute();

            if (!empty($amenityIds)) {
                $insertSql = "INSERT INTO room_amenities
                              (room_id, amenity_id)
                              VALUES
                              (:room_id, :amenity_id)";

                $insertStmt = $this->conn->prepare($insertSql);

                foreach ($amenityIds as $amenityId) {
                    $amenityId = (int) $amenityId;

                    if ($amenityId <= 0) {
                        continue;
                    }

                    $insertStmt->bindParam(":room_id", $roomId, PDO::PARAM_INT);
                    $insertStmt->bindParam(":amenity_id", $amenityId, PDO::PARAM_INT);
                    $insertStmt->execute();
                }
            }

            $this->conn->commit();

            return true;
        } catch (\Throwable $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }
}