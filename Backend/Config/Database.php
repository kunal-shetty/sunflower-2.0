<?php
class Database {
    private $servername = "localhost";
    private $username   = "root";
    private $password   = "";
    private $dbname     = "ToDoList";
    public  $conn;

    public function connect() {
        $this->conn = new mysqli(
            $this->servername,
            $this->username,
            $this->password,
            $this->dbname
        );

        if ($this->conn->connect_error) {
            die("DB Connection Error: " . $this->conn->connect_error);
        }

        return $this->conn;
    }
}
?>
