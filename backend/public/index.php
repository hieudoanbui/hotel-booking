<?php

declare(strict_types=1);

header("Content-Type: application/json; charset=UTF-8");

$allowedOrigins = [
    "http://localhost:5173",
    "http://doanhieu283.rf.gd",
    "https://doanhieu283.rf.gd"
];

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: " . $origin);
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

session_set_cookie_params([
    "httponly" => true,
    "samesite" => "Lax"
]);

session_start();

require_once __DIR__ . "/../config/database.php";

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

$routes = require_once __DIR__ . "/../routes/api.php";

$method = $_SERVER["REQUEST_METHOD"];
$uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

$basePath = dirname($_SERVER["SCRIPT_NAME"]);
$path = substr($uri, strlen($basePath));
$path = "/" . trim($path, "/");

function matchRoute(string $routePath, string $currentPath): array|false
{
    $paramNames = [];

    $pattern = preg_replace_callback('/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/', function ($matches) use (&$paramNames) {
        $paramNames[] = $matches[1];
        return '([0-9]+)';
    }, $routePath);

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

        $controller = new $className($db);
        $controller->$functionName(...array_values($params));
        exit();
    }
}

http_response_code(404);

echo json_encode([
    "success" => false,
    "message" => "API không tồn tại"
], JSON_UNESCAPED_UNICODE);