import { apiRequest } from "../Reusables/api-request";
import { displayToast } from "../Reusables/displayToast";

$(document).ready(() => {
    const addModal = new bootstrap.Modal(document.getElementById('addTaskModal'));
    addModal.show();

    $("#task-form").on("submit", function (e) {
    e.preventDefault();

    let isValid = true;

    // Reset previous errors
    $(".is-invalid").removeClass("is-invalid");

    // Collect form values
    const formData = {
        action: "add",
        title: $("#task-title").val().trim(),
        description: $("#task-desc").val().trim(),
        category: $("#task-category").val() || null,
        priority: $("#priority").val(),
        dueDate: $("#due-date").val() || null,
        dueTime: $("#due-time").val() || null,
        duration: $("#duration").val() || null,
        tags: $("#tags").val() || null,
        reminder: $("#reminder").val() || null,
        recurrence: $("#recurrence").val() || "none",
        hasSubtasks: $("#hasSubtasks").is(":checked") ? 1 : 0,
        notes: $("#notes").val().trim() || null,
        status: $("#status").val(),
    };

    /* ------------------------------
        VALIDATION
    -------------------------------*/

    // Title required
    if (!formData.title) {
        $("#task-title").addClass("is-invalid");
        displayToast("error", "Task title is required");
        isValid = false;
    }

    // Priority required
    if (!formData.priority) {
        $("#priority").addClass("is-invalid");
        displayToast("error", "Select a priority level");
        isValid = false;
    }

    // Status required
    if (!formData.status) {
        $("#status").addClass("is-invalid");
        displayToast("error", "Select a status");
        isValid = false;
    }

    // Duration must be a number
    if (formData.duration && isNaN(formData.duration)) {
        $("#duration").addClass("is-invalid");
        displayToast("error", "Duration must be a valid number");
        isValid = false;
    }

    // stop if invalid
    if (!isValid) return;

    /* ------------------------------
        API REQUEST
    -------------------------------*/
    apiRequest("../../Backend/Tasks.php", "POST", formData, true)
        .done(function (response) {
            if (response.status === "success") {
                displayToast("error", "Task added successfully!");

                $("#addTaskModal").modal("hide");
                $("#task-form")[0].reset();
                loadTasks();
            } else {
                displayToast("error", "Something went wrong.");
            }
        })
        .fail(function (xhr) {
            displayToast("error", "Server error: " + xhr.status);
        });
});

})