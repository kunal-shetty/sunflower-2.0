<?php

require_once "Backend\Config\DatabaseTables";

class User extends Database {

    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Register User
    public function register($name, $email, $password) {

        $sql = "INSERT INTO " . DatabaseTables::USERS->value . " (name, email, password) 
                VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);

        $hashed = password_hash($password, PASSWORD_BCRYPT);
        $stmt->bind_param("sss", $name, $email, $hashed);

        return $stmt->execute();
    }

    // Get User by Email
    public function getByEmail($email) {
        $sql = "SELECT * FROM " . DatabaseTables::USERS->value . " WHERE email = ?";
        $stmt = $this->conn->prepare($sql);

        $stmt->bind_param("s", $email);
        $stmt->execute();

        return $stmt->get_result()->fetch_assoc();
    }
}
?>
