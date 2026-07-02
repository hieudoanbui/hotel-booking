<?php

namespace App\Controllers;

use PDO;
use App\Models\User;
use App\Helpers\Request;
use App\Helpers\Response;

class AuthController
{
    private User $userModel;

    public function __construct(PDO $db)
    {
        $this->userModel = new User($db);
    }

    public function register(): void
    {
        $data = Request::input();

        $name = trim($data["name"] ?? "");
        $email = trim($data["email"] ?? "");
        $phone = trim($data["phone"] ?? "");
        $password = $data["password"] ?? "";

        if ($name === "" || $email === "" || $password === "") {
            Response::error("Vui lòng nhập đầy đủ họ tên, email và mật khẩu.");
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error("Email không hợp lệ.");
        }

        if (strlen($password) < 6) {
            Response::error("Mật khẩu phải có ít nhất 6 ký tự.");
        }

        $existingUser = $this->userModel->findByEmail($email);

        if ($existingUser) {
            Response::error("Email đã tồn tại.");
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $created = $this->userModel->create([
            "name" => $name,
            "email" => $email,
            "phone" => $phone,
            "password" => $hashedPassword
        ]);

        if (!$created) {
            Response::error("Đăng ký thất bại. Vui lòng thử lại.");
        }

        Response::success("Đăng ký tài khoản thành công.", [], 201);
    }

    public function login(): void
    {
        $data = Request::input();

        $email = trim($data["email"] ?? "");
        $password = $data["password"] ?? "";

        if ($email === "" || $password === "") {
            Response::error("Vui lòng nhập email và mật khẩu.");
        }

        $user = $this->userModel->findByEmail($email);

        if (!$user) {
            Response::error("Email hoặc mật khẩu không đúng.", 401);
        }

        if (!password_verify($password, $user["password"])) {
            Response::error("Email hoặc mật khẩu không đúng.", 401);
        }

        $_SESSION["user_id"] = $user["id"];
        $_SESSION["user_name"] = $user["name"];
        $_SESSION["user_role"] = $user["role"];
        $_SESSION["role"] = $user["role"];

        Response::success("Đăng nhập thành công.", [
            "user" => [
                "id" => $user["id"],
                "name" => $user["name"],
                "email" => $user["email"],
                "phone" => $user["phone"] ?? "",
                "avatar_url" => $user["avatar_url"] ?? "",
                "role" => $user["role"]
            ]
        ]);
    }

    public function me(): void
    {
        if (!isset($_SESSION["user_id"])) {
            Response::error("Bạn chưa đăng nhập.", 401);
        }

        $user = $this->userModel->findById((int) $_SESSION["user_id"]);

        if (!$user) {
            Response::error("Không tìm thấy người dùng.", 404);
        }

        Response::success("Lấy thông tin người dùng thành công.", [
            "user" => [
                "id" => $user["id"],
                "name" => $user["name"],
                "email" => $user["email"],
                "phone" => $user["phone"] ?? "",
                "avatar_url" => $user["avatar_url"] ?? "",
                "role" => $user["role"]
            ]
        ]);
    }

    public function logout(): void
    {
        session_unset();
        session_destroy();

        Response::success("Đăng xuất thành công.");
    }
}