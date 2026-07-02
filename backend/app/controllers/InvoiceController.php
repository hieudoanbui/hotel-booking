<?php

namespace App\Controllers;

use PDO;
use App\Models\Invoice;
use App\Helpers\Response;
use App\Middlewares\AuthMiddleware;

class InvoiceController
{
    private Invoice $invoiceModel;

    public function __construct(PDO $db)
    {
        $this->invoiceModel = new Invoice($db);
    }

    public function index(): void
    {
        AuthMiddleware::requireAdmin();

        $invoices = $this->invoiceModel->getAll();

        Response::success("Lấy danh sách hóa đơn thành công.", [
            "invoices" => $invoices
        ]);
    }

    public function markAsPaid(string $id): void
    {
        AuthMiddleware::requireAdmin();

        $invoiceId = (int) $id;

        $updated = $this->invoiceModel->markAsPaid($invoiceId);

        if (!$updated) {
            Response::error("Cập nhật trạng thái thanh toán thất bại.");
        }

        Response::success("Cập nhật hóa đơn đã thanh toán thành công.");
    }
}