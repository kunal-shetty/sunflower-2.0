<?php
header("Content-Type: application/json");
session_start();

require_once "Route.php";
require_once "middlewares/AuthMiddleware.php";

// Controllers
require_once "../controllers/AuthController.php";
require_once "../controllers/TasksController.php";


// -------- AUTH ROUTES --------
Route::group(
    ['prefix' => 'auth', 'controller' => AuthController::class],
    function ($prefix, $controller) {
        Route::post("$prefix/login",    $controller, 'login');
        Route::post("$prefix/register", $controller, 'register');
    }
);


// -------- TASK ROUTES --------
Route::group(
    ['prefix' => '/tasks', 'controller' => 'TasksController'],
    function ($prefix, $controller) {
        Route::post("$prefix/add",   $controller, "addTask", AuthMiddleware::class);
        Route::get("$prefix/list",   $controller, "listTasks", AuthMiddleware::class);
        Route::patch("$prefix/edit", $controller, "updateTask", AuthMiddleware::class);
    }
);

Route::handle();
