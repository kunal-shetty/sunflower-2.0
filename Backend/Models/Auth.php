<?php
require "config/Database.php";
require "models/User.php";
require "controllers/AuthController.php"; // This is correct – include only once

// Initialize database + user + controller
$db = (new Database())->connect();
$userModel = new User($db);
$auth = new AuthController($userModel);

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $action = $_POST['action'] ?? '';

    if ($action === "register") {

        $result = $auth->register(
            $_POST['name'] ?? '',
            $_POST['email'] ?? '',
            $_POST['password'] ?? '',
            $_POST['confirmPassword'] ?? ''
        );

        if ($result['status'] === "success") {
            header("Location: ../Frontend/HTML/home.php");
            exit();
        } else {
            echo $result['message'];
            exit();
        }
    }

    if ($action === "login") {

        $result = $auth->login(
            $_POST['email'] ?? '',
            $_POST['password'] ?? ''
        );

        if ($result['status'] === "success") {
            header("Location: ../Frontend/HTML/home.php");
            exit();
        } else {
            echo $result['message'];
            exit();
        }
    }

    // If no valid action
    echo "Invalid action.";
    exit();
}
