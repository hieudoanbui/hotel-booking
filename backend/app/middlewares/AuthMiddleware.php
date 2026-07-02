<?php

namespace App\Middlewares;

use App\Helpers\Response;

class AuthMiddleware
{
    public static function requireLogin(): void
    {
        if (!isset($_SESSION["user_id"])) {
            Response::error("Bạn cần đăng nhập để thực hiện chức năng này.", 401);
        }
    }

    public static function requireAdmin(): void
    {
        self::requireLogin();

        if ($_SESSION["user_role"] !== "admin") {
            Response::error("Bạn không có quyền truy cập chức năng này.", 403);
        }
    }
}