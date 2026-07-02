<?php

namespace App\Helpers;

class Request
{
    public static function input(): array
    {
        $json = file_get_contents("php://input");
        $data = json_decode($json, true);

        if (is_array($data)) {
            return $data;
        }

        return $_POST;
    }
}