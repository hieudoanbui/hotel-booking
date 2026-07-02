<?php

namespace App\Controllers;

use PDO;
use Throwable;
use App\Helpers\Request;
use App\Helpers\Response;
use App\Middlewares\AuthMiddleware;

class ProfileController
{
    private PDO $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    private function getCurrentUserId(): int
    {
        AuthMiddleware::requireLogin();

        $userId = $_SESSION["user_id"] ?? $_SESSION["id"] ?? null;

        if (!$userId) {
            Response::error("Không tìm thấy thông tin người dùng trong phiên đăng nhập.", 401);
        }

        return (int) $userId;
    }

    public function show(): void
    {
        try {
            $userId = $this->getCurrentUserId();

            $sql = "SELECT id, name, email, phone, avatar_url, role, created_at
                    FROM users
                    WHERE id = :id
                    LIMIT 1";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":id", $userId, PDO::PARAM_INT);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                Response::error("Không tìm thấy tài khoản.", 404);
            }

            Response::success("Lấy thông tin tài khoản thành công.", [
                "user" => $user
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy hồ sơ: " . $e->getMessage(), 500);
        }
    }

    public function update(): void
    {
        try {
            $userId = $this->getCurrentUserId();
            $data = Request::input();

            $name = trim($data["name"] ?? "");
            $email = trim($data["email"] ?? "");
            $phone = trim($data["phone"] ?? "");
            $avatarUrl = trim($data["avatar_url"] ?? "");

            if ($name === "" || $email === "") {
                Response::error("Vui lòng nhập họ tên và email.");
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                Response::error("Email không hợp lệ.");
            }

            $checkSql = "SELECT id FROM users
                         WHERE email = :email
                         AND id != :id
                         LIMIT 1";

            $checkStmt = $this->conn->prepare($checkSql);
            $checkStmt->bindParam(":email", $email);
            $checkStmt->bindParam(":id", $userId, PDO::PARAM_INT);
            $checkStmt->execute();

            $existingUser = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if ($existingUser) {
                Response::error("Email này đã được sử dụng bởi tài khoản khác.");
            }

            $sql = "UPDATE users
                    SET name = :name,
                        email = :email,
                        phone = :phone,
                        avatar_url = :avatar_url
                    WHERE id = :id";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":phone", $phone);
            $stmt->bindParam(":avatar_url", $avatarUrl);
            $stmt->bindParam(":id", $userId, PDO::PARAM_INT);

            $updated = $stmt->execute();

            if (!$updated) {
                Response::error("Cập nhật hồ sơ thất bại.");
            }

            $_SESSION["user_name"] = $name;

            $userSql = "SELECT id, name, email, phone, avatar_url, role, created_at
                        FROM users
                        WHERE id = :id
                        LIMIT 1";

            $userStmt = $this->conn->prepare($userSql);
            $userStmt->bindParam(":id", $userId, PDO::PARAM_INT);
            $userStmt->execute();

            $user = $userStmt->fetch(PDO::FETCH_ASSOC);

            Response::success("Cập nhật hồ sơ thành công.", [
                "user" => $user
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi cập nhật hồ sơ: " . $e->getMessage(), 500);
        }
    }

    public function changePassword(): void
    {
        try {
            $userId = $this->getCurrentUserId();
            $data = Request::input();

            $oldPassword = trim($data["old_password"] ?? "");
            $newPassword = trim($data["new_password"] ?? "");
            $confirmPassword = trim($data["confirm_password"] ?? "");

            if ($oldPassword === "" || $newPassword === "" || $confirmPassword === "") {
                Response::error("Vui lòng nhập đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu.");
            }

            if (strlen($newPassword) < 6) {
                Response::error("Mật khẩu mới phải có ít nhất 6 ký tự.");
            }

            if ($newPassword !== $confirmPassword) {
                Response::error("Mật khẩu xác nhận không khớp.");
            }

            $sql = "SELECT id, password
                    FROM users
                    WHERE id = :id
                    LIMIT 1";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":id", $userId, PDO::PARAM_INT);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                Response::error("Không tìm thấy tài khoản.", 404);
            }

            if (!password_verify($oldPassword, $user["password"])) {
                Response::error("Mật khẩu cũ không đúng.");
            }

            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

            $updateSql = "UPDATE users
                          SET password = :password
                          WHERE id = :id";

            $updateStmt = $this->conn->prepare($updateSql);
            $updateStmt->bindParam(":password", $hashedPassword);
            $updateStmt->bindParam(":id", $userId, PDO::PARAM_INT);

            $updated = $updateStmt->execute();

            if (!$updated) {
                Response::error("Đổi mật khẩu thất bại.");
            }

            Response::success("Đổi mật khẩu thành công.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi đổi mật khẩu: " . $e->getMessage(), 500);
        }
    }
}