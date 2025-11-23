<?php
class AuthController
{
    private $user;

    public function __construct($userModel)
    {
        $this->user = $userModel;
    }

    /* -----------------------------
       REGISTER
    ------------------------------ */
    public function register($name, $email, $password, $confirmPassword)
    {
        // Validate empty fields
        if (empty($name) || empty($email) || empty($password) || empty($confirmPassword)) {
            return ["status" => "error", "message" => "All fields are required"];
        }

        // Password mismatch
        if ($password !== $confirmPassword) {
            return ["status" => "error", "message" => "Passwords do not match"];
        }

        // Check if email already exists
        $existing = $this->user->getByEmail($email);
        if ($existing) {
            return ["status" => "error", "message" => "Email already registered"];
        }

        // Attempt registration
        $success = $this->user->register($name, $email, $password);

        if ($success) {
            return ["status" => "success"];
        }

        return ["status" => "error", "message" => "Registration failed"];
    }

    /* -----------------------------
       LOGIN
    ------------------------------ */
    public function login($email, $password)
    {
        // Validate empty fields
        if (empty($email) || empty($password)) {
            return ["status" => "error", "message" => "Email & password required"];
        }

        // Find user
        $user = $this->user->getByEmail($email);

        if (!$user) {
            return ["status" => "error", "message" => "No account found"];
        }

        // Verify password
        if (!password_verify($password, $user['password'])) {
            return ["status" => "error", "message" => "Invalid password"];
        }

        // Start session only if not already active
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $_SESSION['userId'] = $user['userId'];
        $_SESSION['name']   = $user['name'];
        $_SESSION['email']  = $user['email'];

        return ["status" => "success"];
    }
}
?>
