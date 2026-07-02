<?php

namespace App\Helpers;

class Response
{
    public static function json(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);

        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit();
    }

    public static function success(string $message, array $data = [], int $statusCode = 200): void
    {
        self::json([
            "success" => true,
            "message" => $message,
            "data" => $data
        ], $statusCode);
    }

    public static function error(string $message, int $statusCode = 400): void
    {
        self::json([
            "success" => false,
            "message" => $message
        ], $statusCode);
    }
}