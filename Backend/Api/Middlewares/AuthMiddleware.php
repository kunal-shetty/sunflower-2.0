<?php
class AuthMiddleware {
    public function handle() {
        if (!isset($_SESSION['userId'])) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            exit;
        }
    }
}
