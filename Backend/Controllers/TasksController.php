<?php
class TasksController {

    private $task;

    public function __construct($taskModel) {
        $this->task = $taskModel;
    }

    public function addTask($data) {

        if (!isset($_SESSION['userId'])) {
            return ["status" => "error", "message" => "Not logged in"];
        }

        $data['userId'] = $_SESSION['userId'];

        $success = $this->task->addTask($data);

        if ($success) {
            return ["status" => "success", "message" => "Task added"];
        }

        return ["status" => "error", "message" => "Task failed"];
    }
}
?>
