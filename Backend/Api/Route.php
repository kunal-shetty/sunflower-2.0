<?php

class Route
{
    private static $routes = [];
    private static $groupData = [];

    /* -----------------------
        GROUPING
    ------------------------*/
    public static function group($settings, $callback)
    {
        self::$groupData = [
            "prefix"     => $settings['prefix'] ?? "",
            "controller" => $settings['controller'] ?? ""
        ];

        $callback(self::$groupData['prefix'], self::$groupData['controller']);

        self::$groupData = []; // clear after group
    }


    /* -----------------------
        REGISTER ROUTES
    ------------------------*/
    public static function get($route, $controller, $method, ...$middlewares)
    {
        self::register("GET", $route, $controller, $method, $middlewares);
    }

    public static function post($route, $controller, $method, ...$middlewares)
    {
        self::register("POST", $route, $controller, $method, $middlewares);
    }

    public static function patch($route, $controller, $method, ...$middlewares)
    {
        self::register("PATCH", $route, $controller, $method, $middlewares);
    }

    /* -----------------------
        ROUTE STORAGE
    ------------------------*/
    private static function register($httpMethod, $route, $controller, $method, $middlewares)
    {
        self::$routes[] = [
            "method"      => $httpMethod,
            "route"       => $route,
            "controller"  => $controller,
            "function"    => $method,
            "middlewares" => $middlewares,
        ];
    }

    /* -----------------------
        EXECUTION
    ------------------------*/
    public static function handle()
    {
        $requestedRoute  = $_GET['route'] ?? "/";
        $requestedMethod = $_SERVER['REQUEST_METHOD'];

        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) $_POST = $data;
        print_r($data);
        foreach (self::$routes as $r) {
            if ($requestedRoute === $r['route'] && $requestedMethod === $r['method']) {

                // Run middlewares
                foreach ($r['middlewares'] as $mw) {
                    (new $mw())->handle();
                }

                $controller = new $r['controller']();
                $method     = $r['function'];

                echo json_encode($controller->$method($_POST));
                return;
            }
        }

        echo json_encode([
            "status" => "error",
            "message" => "Route not found: " . $requestedRoute
        ]);
    }
}
