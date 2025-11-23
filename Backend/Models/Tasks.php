<?php
class Tasks {

    private $conn;
    private $table = "tasks";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function addTask($data) {

        $sql = "INSERT INTO $this->table 
        (userId, title, description, category, priority, dueDate, dueTime, duration, tags, reminder, recurrence, hasSubtasks, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($sql);

        $stmt->bind_param(
            "isssssissisisi",
            $data['userId'],
            $data['title'],
            $data['description'],
            $data['category'],
            $data['priority'],
            $data['dueDate'],
            $data['dueTime'],
            $data['duration'],
            $data['tags'],
            $data['reminder'],
            $data['recurrence'],
            $data['hasSubtasks'],
            $data['notes'],
            $data['status']
        );

        return $stmt->execute();
    }
}
?>
