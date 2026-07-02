<?php

namespace App\Controllers;

use PDO;
use Throwable;
use App\Helpers\Request;
use App\Helpers\Response;

class PasswordController
{
    private PDO $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function forgotPassword(): void
    {
        try {
            $data = Request::input();

            $email = trim($data["email"] ?? "");
            $phone = trim($data["phone"] ?? "");
            $password = trim($data["password"] ?? "");
            $confirmPassword = trim($data["confirm_password"] ?? "");

            if ($email === "" || $phone === "" || $password === "" || $confirmPassword === "") {
                Response::error("Vui lòng nhập đầy đủ email, số điện thoại và mật khẩu mới.");
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                Response::error("Email không hợp lệ.");
            }

            if (strlen($password) < 6) {
                Response::error("Mật khẩu mới phải có ít nhất 6 ký tự.");
            }

            if ($password !== $confirmPassword) {
                Response::error("Mật khẩu xác nhận không khớp.");
            }

            $sql = "SELECT id, name, email, phone, role
                    FROM users
                    WHERE email = :email
                    AND role = 'customer'
                    LIMIT 1";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":email", $email);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                Response::error("Không tìm thấy tài khoản khách hàng với email này.");
            }

            $savedPhone = trim($user["phone"] ?? "");

            if ($savedPhone === "" || $savedPhone !== $phone) {
                Response::error("Số điện thoại không khớp với tài khoản đã đăng ký.");
            }

            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            $updateSql = "UPDATE users
                          SET password = :password
                          WHERE id = :id
                          AND role = 'customer'";

            $updateStmt = $this->conn->prepare($updateSql);
            $updateStmt->bindParam(":password", $hashedPassword);
            $updateStmt->bindParam(":id", $user["id"], PDO::PARAM_INT);

            $updated = $updateStmt->execute();

            if (!$updated) {
                Response::error("Đổi mật khẩu thất bại.");
            }

            Response::success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi đổi mật khẩu: " . $e->getMessage(), 500);
        }
    }
}