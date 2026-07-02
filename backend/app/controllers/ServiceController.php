<?php

namespace App\Controllers;

use PDO;
use Throwable;
use App\Models\Service;
use App\Helpers\Request;
use App\Helpers\Response;
use App\Middlewares\AuthMiddleware;

class ServiceController
{
    private Service $serviceModel;

    public function __construct(PDO $db)
    {
        $this->serviceModel = new Service($db);
    }

    private function requireAdmin(): void
    {
        AuthMiddleware::requireLogin();

        $role = $_SESSION["role"] ?? $_SESSION["user_role"] ?? "";

        if ($role !== "admin") {
            Response::error("Bạn không có quyền thực hiện chức năng này.", 403);
        }
    }

    public function index(): void
    {
        try {
            $services = $this->serviceModel->getActive();

            Response::success("Lấy danh sách dịch vụ thành công.", [
                "services" => $services
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy danh sách dịch vụ: " . $e->getMessage(), 500);
        }
    }

    public function adminIndex(): void
    {
        try {
            $this->requireAdmin();

            $services = $this->serviceModel->getAll();

            Response::success("Lấy danh sách dịch vụ admin thành công.", [
                "services" => $services
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy danh sách dịch vụ admin: " . $e->getMessage(), 500);
        }
    }

    public function store(): void
    {
        try {
            $this->requireAdmin();

            $data = Request::input();

            $name = trim($data["name"] ?? "");
            $description = trim($data["description"] ?? "");
            $price = (float) ($data["price"] ?? 0);
            $status = trim($data["status"] ?? "active");

            if ($name === "") {
                Response::error("Vui lòng nhập tên dịch vụ.");
            }

            if ($price < 0) {
                Response::error("Giá dịch vụ không hợp lệ.");
            }

            if (!in_array($status, ["active", "inactive"])) {
                $status = "active";
            }

            $created = $this->serviceModel->create([
                "name" => $name,
                "description" => $description,
                "price" => $price,
                "status" => $status
            ]);

            if (!$created) {
                Response::error("Thêm dịch vụ thất bại.");
            }

            Response::success("Thêm dịch vụ thành công.", [], 201);
        } catch (Throwable $e) {
            Response::error("Lỗi khi thêm dịch vụ: " . $e->getMessage(), 500);
        }
    }

    public function update(string $id): void
    {
        try {
            $this->requireAdmin();

            $serviceId = (int) $id;
            $data = Request::input();

            if ($serviceId <= 0) {
                Response::error("Mã dịch vụ không hợp lệ.");
            }

            $service = $this->serviceModel->findById($serviceId);

            if (!$service) {
                Response::error("Không tìm thấy dịch vụ.", 404);
            }

            $name = trim($data["name"] ?? "");
            $description = trim($data["description"] ?? "");
            $price = (float) ($data["price"] ?? 0);
            $status = trim($data["status"] ?? "active");

            if ($name === "") {
                Response::error("Vui lòng nhập tên dịch vụ.");
            }

            if ($price < 0) {
                Response::error("Giá dịch vụ không hợp lệ.");
            }

            if (!in_array($status, ["active", "inactive"])) {
                $status = "active";
            }

            $updated = $this->serviceModel->update($serviceId, [
                "name" => $name,
                "description" => $description,
                "price" => $price,
                "status" => $status
            ]);

            if (!$updated) {
                Response::error("Cập nhật dịch vụ thất bại.");
            }

            Response::success("Cập nhật dịch vụ thành công.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi cập nhật dịch vụ: " . $e->getMessage(), 500);
        }
    }

    public function destroy(string $id): void
    {
        try {
            $this->requireAdmin();

            $serviceId = (int) $id;

            if ($serviceId <= 0) {
                Response::error("Mã dịch vụ không hợp lệ.");
            }

            $service = $this->serviceModel->findById($serviceId);

            if (!$service) {
                Response::error("Không tìm thấy dịch vụ.", 404);
            }

            $hidden = $this->serviceModel->hide($serviceId);

            if (!$hidden) {
                Response::error("Ẩn dịch vụ thất bại.");
            }

            Response::success("Ẩn dịch vụ thành công.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi ẩn dịch vụ: " . $e->getMessage(), 500);
        }
    }
}