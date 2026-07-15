<?php

declare(strict_types=1);

error_reporting(E_ALL);
ini_set("display_errors", "1");

header("Content-Type: application/json; charset=UTF-8");

$allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://doanhieu283.rf.gd",
    "https://doanhieu283.rf.gd"
];

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Access-Control-Allow-Credentials: true");
}

header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "OPTIONS OK"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$method = $_SERVER["REQUEST_METHOD"];
$uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

$basePath = dirname($_SERVER["SCRIPT_NAME"]);
$path = substr($uri, strlen($basePath));
$path = "/" . trim($path, "/");

if ($path === "/api/ping") {
    echo json_encode([
        "success" => true,
        "message" => "API đang chạy",
        "path" => $path
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . "/../config/database.php";

if ($path === "/api/db-test") {
    try {
        $database = new Database();
        $db = $database->connect();

        echo json_encode([
            "success" => true,
            "message" => "Kết nối database thành công"
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Throwable $e) {
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Kết nối database thất bại",
            "error" => $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

session_set_cookie_params([
    "httponly" => true,
    "samesite" => "Lax"
]);

session_start();

spl_autoload_register(function ($class) {
    $prefix = "App\\";
    $baseDir = __DIR__ . "/../app/";

    $len = strlen($prefix);

    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace("\\", "/", $relativeClass) . ".php";

    if (file_exists($file)) {
        require_once $file;
    }
});

function matchRoute(string $routePath, string $currentPath): array|false
{
    $paramNames = [];

    $pattern = preg_replace_callback(
        '/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/',
        function ($matches) use (&$paramNames) {
            $paramNames[] = $matches[1];
            return '([0-9]+)';
        },
        $routePath
    );

    $pattern = '#^' . $pattern . '$#';

    if (!preg_match($pattern, $currentPath, $matches)) {
        return false;
    }

    array_shift($matches);

    $params = [];

    foreach ($paramNames as $index => $name) {
        $params[$name] = $matches[$index];
    }

    return $params;
}

try {
    $routes = require_once __DIR__ . "/../routes/api.php";

    foreach ($routes as $route) {
        [$routeMethod, $routePath, $handler] = $route;

        if ($method !== $routeMethod) {
            continue;
        }

        $params = matchRoute($routePath, $path);

        if ($params !== false) {
            [$className, $functionName] = $handler;

            $database = new Database();
            $db = $database->connect();

            if (!class_exists($className)) {
                http_response_code(500);

                echo json_encode([
                    "success" => false,
                    "message" => "Không tìm thấy controller",
                    "controller" => $className
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $controller = new $className($db);

            if (!method_exists($controller, $functionName)) {
                http_response_code(500);

                echo json_encode([
                    "success" => false,
                    "message" => "Không tìm thấy function trong controller",
                    "controller" => $className,
                    "function" => $functionName
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $controller->$functionName(...array_values($params));
            exit;
        }
    }

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" => "API không tồn tại",
        "method" => $method,
        "path" => $path
    ], JSON_UNESCAPED_UNICODE);
    exit;
} catch (Throwable $e) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Lỗi server backend",
        "error" => $e->getMessage(),
        "file" => $e->getFile(),
        "line" => $e->getLine()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}