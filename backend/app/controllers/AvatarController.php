<?php

namespace App\Controllers;

use PDO;
use Throwable;
use App\Helpers\Response;
use App\Middlewares\AuthMiddleware;

class AvatarController
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
            Response::error("Bạn chưa đăng nhập.", 401);
        }

        return (int) $userId;
    }

    public function upload(): void
    {
        try {
            $userId = $this->getCurrentUserId();

            if (!isset($_FILES["avatar"])) {
                Response::error("Vui lòng chọn ảnh đại diện.");
            }

            $file = $_FILES["avatar"];

            if ($file["error"] !== UPLOAD_ERR_OK) {
                Response::error("Upload ảnh thất bại.");
            }

            if ($file["size"] > 5 * 1024 * 1024) {
                Response::error("Ảnh không được vượt quá 5MB.");
            }

            $tmpName = $file["tmp_name"];
            $mimeType = mime_content_type($tmpName);

            $allowedTypes = [
                "image/jpeg" => "jpg",
                "image/png" => "png",
                "image/webp" => "webp"
            ];

            if (!array_key_exists($mimeType, $allowedTypes)) {
                Response::error("Chỉ cho phép ảnh JPG, PNG hoặc WEBP.");
            }

            $extension = $allowedTypes[$mimeType];

            $projectRoot = dirname(__DIR__, 3);

            $localAvatarDir = $projectRoot . "/frontend/public/images/avatars";
            $hostingAvatarDir = $projectRoot . "/images/avatars";

            $uploadDir = is_dir($localAvatarDir)
                ? $localAvatarDir
                : $hostingAvatarDir;

            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $fileName = "avatar_" . $userId . "_" . time() . "." . $extension;
            $targetPath = $uploadDir . "/" . $fileName;

            if (!move_uploaded_file($tmpName, $targetPath)) {
                Response::error("Không thể lưu ảnh đại diện.");
            }

            $avatarUrl = "/images/avatars/" . $fileName;

            $updateSql = "UPDATE users
                          SET avatar_url = :avatar_url
                          WHERE id = :id";

            $updateStmt = $this->conn->prepare($updateSql);
            $updateStmt->bindParam(":avatar_url", $avatarUrl);
            $updateStmt->bindParam(":id", $userId, PDO::PARAM_INT);
            $updateStmt->execute();

            $userSql = "SELECT id, name, email, phone, avatar_url, role, created_at
                        FROM users
                        WHERE id = :id
                        LIMIT 1";

            $userStmt = $this->conn->prepare($userSql);
            $userStmt->bindParam(":id", $userId, PDO::PARAM_INT);
            $userStmt->execute();

            $user = $userStmt->fetch(PDO::FETCH_ASSOC);

            Response::success("Cập nhật ảnh đại diện thành công.", [
                "user" => $user
            ]);
        } catch (Throwable $e) {
            Response::error("Lỗi khi upload avatar: " . $e->getMessage(), 500);
        }
    }
}