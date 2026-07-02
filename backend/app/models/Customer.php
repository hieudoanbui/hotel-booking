<?php

namespace App\Models;

use PDO;

class Customer
{
    private PDO $conn;
    private string $table = "users";

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function getAll(): array
    {
        $sql = "SELECT id, name, email, phone, role, created_at
                FROM {$this->table}
                WHERE role = 'customer'
                ORDER BY id DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT id, name, email, phone, role, created_at
                FROM {$this->table}
                WHERE id = :id
                AND role = 'customer'
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        $customer = $stmt->fetch(PDO::FETCH_ASSOC);

        return $customer ?: null;
    }

    public function findByEmail(string $email): ?array
    {
        $sql = "SELECT *
                FROM {$this->table}
                WHERE email = :email
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }

    public function create(array $data): bool
    {
        $sql = "INSERT INTO {$this->table}
                (name, email, password, phone, role)
                VALUES
                (:name, :email, :password, :phone, :role)";

        $stmt = $this->conn->prepare($sql);

        $role = "customer";
        $hashedPassword = password_hash($data["password"], PASSWORD_DEFAULT);

        $stmt->bindParam(":name", $data["name"]);
        $stmt->bindParam(":email", $data["email"]);
        $stmt->bindParam(":password", $hashedPassword);
        $stmt->bindParam(":phone", $data["phone"]);
        $stmt->bindParam(":role", $role);

        return $stmt->execute();
    }

    public function update(int $id, array $data): bool
    {
        if (!empty($data["password"])) {
            $sql = "UPDATE {$this->table}
                    SET name = :name,
                        email = :email,
                        phone = :phone,
                        password = :password
                    WHERE id = :id
                    AND role = 'customer'";

            $stmt = $this->conn->prepare($sql);

            $hashedPassword = password_hash($data["password"], PASSWORD_DEFAULT);

            $stmt->bindParam(":password", $hashedPassword);
        } else {
            $sql = "UPDATE {$this->table}
                    SET name = :name,
                        email = :email,
                        phone = :phone
                    WHERE id = :id
                    AND role = 'customer'";

            $stmt = $this->conn->prepare($sql);
        }

        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->bindParam(":name", $data["name"]);
        $stmt->bindParam(":email", $data["email"]);
        $stmt->bindParam(":phone", $data["phone"]);

        return $stmt->execute();
    }

    public function hasRelatedData(int $id): bool
    {
        $sql = "SELECT COUNT(*) 
                FROM bookings
                WHERE user_id = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        return (int) $stmt->fetchColumn() > 0;
    }

    public function delete(int $id): bool
    {
        $sql = "DELETE FROM {$this->table}
                WHERE id = :id
                AND role = 'customer'";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);

        return $stmt->execute();
    }
}