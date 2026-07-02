<?php

namespace App\Controllers;

use PDO;
use Throwable;
use App\Models\Customer;
use App\Helpers\Request;
use App\Helpers\Response;
use App\Middlewares\AuthMiddleware;

class CustomerController
{
    private Customer $customerModel;

    public function __construct(PDO $db)
    {
        $this->customerModel = new Customer($db);
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
            $this->requireAdmin();

            $customers = $this->customerModel->getAll();

            Response::success("Lấy danh sách khách hàng thành công.", [
                "customers" => $customers
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi lấy danh sách khách hàng: " . $e->getMessage(), 500);
        }
    }

    public function store(): void
    {
        try {
            $this->requireAdmin();

            $data = Request::input();

            $name = trim($data["name"] ?? "");
            $email = trim($data["email"] ?? "");
            $password = trim($data["password"] ?? "");
            $phone = trim($data["phone"] ?? "");

            if ($name === "" || $email === "" || $password === "") {
                Response::error("Vui lòng nhập đầy đủ họ tên, email và mật khẩu.");
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                Response::error("Email không hợp lệ.");
            }

            if (strlen($password) < 6) {
                Response::error("Mật khẩu phải có ít nhất 6 ký tự.");
            }

            $existingUser = $this->customerModel->findByEmail($email);

            if ($existingUser) {
                Response::error("Email này đã tồn tại trong hệ thống.");
            }

            $created = $this->customerModel->create([
                "name" => $name,
                "email" => $email,
                "password" => $password,
                "phone" => $phone
            ]);

            if (!$created) {
                Response::error("Thêm khách hàng thất bại.");
            }

            Response::success("Thêm khách hàng thành công.", [], 201);
        } catch (Throwable $e) {
            Response::error("Lỗi khi thêm khách hàng: " . $e->getMessage(), 500);
        }
    }

    public function update(string $id): void
    {
        try {
            $this->requireAdmin();

            $customerId = (int) $id;
            $data = Request::input();

            $name = trim($data["name"] ?? "");
            $email = trim($data["email"] ?? "");
            $phone = trim($data["phone"] ?? "");
            $password = trim($data["password"] ?? "");

            if ($customerId <= 0) {
                Response::error("Mã khách hàng không hợp lệ.");
            }

            $customer = $this->customerModel->findById($customerId);

            if (!$customer) {
                Response::error("Không tìm thấy khách hàng.", 404);
            }

            if ($name === "" || $email === "") {
                Response::error("Vui lòng nhập họ tên và email.");
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                Response::error("Email không hợp lệ.");
            }

            if ($password !== "" && strlen($password) < 6) {
                Response::error("Mật khẩu mới phải có ít nhất 6 ký tự.");
            }

            $existingUser = $this->customerModel->findByEmail($email);

            if ($existingUser && (int) $existingUser["id"] !== $customerId) {
                Response::error("Email này đã được sử dụng bởi tài khoản khác.");
            }

            $updated = $this->customerModel->update($customerId, [
                "name" => $name,
                "email" => $email,
                "phone" => $phone,
                "password" => $password
            ]);

            if (!$updated) {
                Response::error("Cập nhật khách hàng thất bại.");
            }

            Response::success("Cập nhật khách hàng thành công.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi cập nhật khách hàng: " . $e->getMessage(), 500);
        }
    }

    public function destroy(string $id): void
    {
        try {
            $this->requireAdmin();

            $customerId = (int) $id;

            if ($customerId <= 0) {
                Response::error("Mã khách hàng không hợp lệ.");
            }

            $customer = $this->customerModel->findById($customerId);

            if (!$customer) {
                Response::error("Không tìm thấy khách hàng.", 404);
            }

            if ($this->customerModel->hasRelatedData($customerId)) {
                Response::error("Không thể xóa khách hàng đã có đơn đặt phòng. Bạn có thể cập nhật thông tin thay vì xóa.");
            }

            $deleted = $this->customerModel->delete($customerId);

            if (!$deleted) {
                Response::error("Xóa khách hàng thất bại.");
            }

            Response::success("Xóa khách hàng thành công.");
        } catch (Throwable $e) {
            Response::error("Lỗi khi xóa khách hàng: " . $e->getMessage(), 500);
        }
    }
}