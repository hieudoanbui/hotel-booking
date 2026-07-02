<?php

namespace App\Models;

use PDO;

class User
{
    private PDO $conn;
    private string $table = "users";

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function findByEmail(string $email): ?array
    {
        $sql = "SELECT id, name, email, phone, avatar_url, password, role, created_at
                FROM {$this->table}
                WHERE email = :email
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT id, name, email, phone, avatar_url, role, created_at
                FROM {$this->table}
                WHERE id = :id
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }

    public function create(array $data): bool
    {
        $sql = "INSERT INTO {$this->table}
                (name, email, phone, password, role)
                VALUES
                (:name, :email, :phone, :password, :role)";

        $stmt = $this->conn->prepare($sql);

        $role = "customer";

        $stmt->bindParam(":name", $data["name"]);
        $stmt->bindParam(":email", $data["email"]);
        $stmt->bindParam(":phone", $data["phone"]);
        $stmt->bindParam(":password", $data["password"]);
        $stmt->bindParam(":role", $role);

        return $stmt->execute();
    }
}