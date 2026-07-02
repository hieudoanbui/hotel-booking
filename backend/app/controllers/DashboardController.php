<?php

namespace App\Controllers;

use PDO;
use Throwable;
use App\Models\Dashboard;
use App\Helpers\Response;
use App\Middlewares\AuthMiddleware;

class DashboardController
{
    private $dashboardModel;

    public function __construct(PDO $db)
    {
        $this->dashboardModel = new Dashboard($db);
    }

    private function requireAdmin()
    {
        AuthMiddleware::requireLogin();

        $role = $_SESSION["role"] ?? $_SESSION["user_role"] ?? "";

        if ($role !== "admin") {
            Response::error("Bạn không có quyền truy cập chức năng này.", 403);
        }
    }

    public function index()
    {
        try {
            $this->requireAdmin();

            $stats = $this->dashboardModel->getStats();

            Response::success("Lấy dữ liệu dashboard thành công.", [
                "stats" => $stats
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy dữ liệu dashboard: " . $e->getMessage(), 500);
        }
    }
}