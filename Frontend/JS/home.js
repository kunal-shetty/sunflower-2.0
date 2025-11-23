import { dateAndTimeFormat, getDateForDisplayLabel, convertToAmPmRange, capitalize } from "../Reusables/helper";
import { displayToast } from "../Reusables/toast";

function getPriorityDot(priority) {
    const p = priority?.toLowerCase();

    const colors = {
        urgent: "background:#ff3b30; box-shadow:0 0 6px #ff3b30;",
        high: "background:#ff3b30;",
        medium: "background:#f1c40f;",
        low: "background:#2ecc71;"
    };

    const isUrgent = p === "urgent";

    return `
        <span class="${isUrgent ? 'priority-urgent' : ''}"
            style="
                width:12px;
        height:12px;
        display:inline-block;
        border-radius:50%;
        margin-left:6px;
                ${colors[p] || "background:#bdc3c7;"}
            ">
        </span>`;
}



function getStatusIcon(status) {
    if (status === "completed") return "✅";
    if (status === "pending") return "⏳";
    if (status === "in-progress") return "🚧";
    if (status === "archived") return "📦";
    return "📋";
}

function getCategoryIcon(category) {
    const icons = {
        "work": "💼",
        "personal": "👤",
        "shopping": "🛒",
        "health": "❤️",
        "finance": "💰",
        "education": "📚",
        "home": "🏠",
        "other": "📌"
    };
    return icons[category?.toLowerCase()] || "📋";
}

function renderTags(tagsString) {
    if (!tagsString) return "";
    const tags = tagsString.split(",").slice(0, 3); // Show max 3 tags
    return tags.map(tag =>
        `                                            <span class="badge bg-light rounded-pill text-dark border px-2 py-1 small">
                                                <i class="ri-price-tag-3-line me-1"></i>${capitalize(tag)}
                                            </span>`
    ).join("");
}

function getPriorityBadge(priority) {
    const p = priority?.toLowerCase();
    const colors = {
        urgent: "bg-danger text-white",
        high: "bg-danger text-white",
        medium: "bg-warning text-dark",
        low: "bg-success text-white"
    };
    return `<span class="badge ${colors[p] || "bg-secondary"} ms-2 end"></span>`;
}

function getTimeLeftLabel(task) {
    if (!task.dueDate) {
        return { label: "No due date", color: "text-muted" };
    }

    const now = new Date();
    const due = new Date(task.dueDate + (task.dueTime ? " " + task.dueTime : " 23:59"));

    const ms = due - now;
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // --- OVERDUE ---
    if (ms < 0) {
        const overdueM = Math.abs(minutes);
        const overdueH = Math.abs(hours);
        const overdueD = Math.abs(days);

        if (overdueD >= 1 && overdueD >= 24)
            return { label: `⚠️ Overdue by ${overdueD} day${overdueD > 1 ? "s" : ""}`, color: "text-danger" };

        if (overdueH >= 1)
            return { label: `⚠️ Overdue by ${overdueH} ${overdueH == 1 ? `hour` : `hours`}`, color: "text-danger" };

        return { label: `⚠️ Overdue by ${overdueM} minutes`, color: "text-danger" };
    }

    // --- DUE TODAY ---
    if (days === 0) {
        if (hours >= 1) return { label: `Due in ${hours} hours`, color: "text-warning" };
        return { label: `Due in ${minutes} minutes`, color: "text-warning" };
    }

    // --- TOMORROW ---
    if (days === 1) return { label: "Due Tomorrow", color: "text-primary" };

    // --- THIS WEEK ---
    if (days <= 7) return { label: `Due in ${days} days`, color: "text-primary" };

    // --- LATER ---
    return { label: `Due on ${formatDateForDisplayLabel(task.dueDate)}`, color: "text-muted" };
}


function formatDateForDisplayLabel(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}


function populateTasks(containerSelector, tasks) {
    const container = document.querySelector(containerSelector);
    container.innerHTML = "";

    if (!tasks || tasks.length === 0) {
        container.innerHTML = `
        <div class="text-center py-5 px-3">
            <div style="font-size: 4rem;">📝</div>
            <h5 class="fw-bold mt-3 mb-2" style="color: #2C3E50;">No Tasks</h5>
            <p class="text-muted small">Tap + to add</p>
        </div>`;
        return;
    }

    const visibleTasks = tasks.filter(task => task.status !== "archived");

    if (visibleTasks.length === 0) {
        container.innerHTML = `
        <div class="text-center py-5 px-3">
            <div style="font-size: 4rem;">📝</div>
            <h5 class="fw-bold mt-3 mb-2" style="color: #2C3E50;">No Tasks</h5>
            <p class="text-muted small">Tap + to add</p>
        </div>`;
        return;
    }

    visibleTasks.forEach(task => {
        const isCompleted = task.status === "completed";

        container.innerHTML += `
        <div class="card shadow-sm border-0 mb-3 task-animate"
            data-id="${task.taskId}"
            style="border-radius: 18px; background: #ffffff; border-left: 4px solid #42b0ff;">
            
            <div class="card-body p-3">

                <!-- TOP ROW -->
                <div class="d-flex align-items-start gap-2 mb-2">

                    <input type="checkbox"
                        class="form-check-input mt-1 task-checkbox"
                        ${isCompleted ? "checked" : ""}
                        data-id="${task.taskId}"
                        style="width: 20px; height: 20px; cursor:pointer;">

                    <div class="flex-grow-1">

                        <!-- Title + Priority Dot -->
                        <h6 class="fw-bold mb-1 ${isCompleted ? "text-decoration-line-through text-muted" : ""}">
                            ${task.title}
                            ${getPriorityDot(task.priority)}
                        </h6>
                        ${isCompleted ? "" : `<div class="small fw-semibold ${getTimeLeftLabel(task).color}">
                            ${getTimeLeftLabel(task).label}
                        </div>`}
                        <!-- TIME LEFT LABEL -->
                        

                        <!-- Tags -->
                        ${task.tags ? `<div class="mt-2">${renderTags(task.tags)}</div>` : ""}
                    </div>

                </div>

                <!-- DESCRIPTION -->
                ${task.description ? `<p class="small text-muted mb-3" style="line-height:1.3;">${task.description}</p>` : ""}

                <!-- ACTION BAR -->
                <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">

                    <!-- Status -->
                    <span class="small fw-semibold ${isCompleted ? "text-success" : "text-primary"}">
                        ${isCompleted ? "✓ Completed" : "⏳ Pending"}
                    </span>

                    <div class="d-flex align-items-center gap-3">

                        <i class="ri-heart-${task.favorite ? "fill text-danger" : "line text-muted"} fs-5 action-fav"
                            data-id="${task.taskId}" style="cursor:pointer;"></i>

                        <i class="ri-edit-line text-primary fs-5 action-edit"
                            data-id="${task.taskId}" style="cursor:pointer;"></i>

                        <i class="ri-archive-line text-warning fs-5 action-archive"
                            data-id="${task.taskId}" style="cursor:pointer;"></i>

                        <i class="ri-delete-bin-line text-danger fs-5 action-delete"
                            data-id="${task.taskId}" style="cursor:pointer;"></i>
                    </div>
                </div>

            </div>
        </div>`;
    });

    // ANIMATION
    const cards = container.querySelectorAll(".task-animate");
    cards.forEach((card, index) => {
        setTimeout(() => card.classList.add("show"), index * 80);
    });
}




$(document).ready(() => {
    const sampleTasks = [
        {
            "taskId": 1,
            "userId": 12,
            "title": "Buy Groceries",
            "description": "Buy milk, vegetables, rice, and snacks.",
            "category": "Personal",
            "priority": "Urgent",
            "dueDate": "2025-11-19",
            "dueTime": "18:30",
            "duration": "30m",
            "tags": "home,shopping",
            "reminder": "2025-02-18 17:00",
            "recurrence": "None",
            "hasSubtasks": 0,
            "notes": "Use discount coupons",
            "status": "pending",
            "favorite": 1,
            "createdAt": "2025-02-10 10:22:00",
            "updatedAt": "2025-02-10 10:22:00"
        },
        {
            "taskId": 2,
            "userId": 12,
            "title": "Project Report",
            "description": "Finish the environmental science project report.",
            "category": "Work",
            "priority": "Medium",
            "dueDate": "2025-11-24",
            "dueTime": "23:59",
            "duration": "2h",
            "tags": "college,project,report",
            "reminder": "2025-02-20 20:00",
            "recurrence": "None",
            "hasSubtasks": 1,
            "notes": "Attach PDFs and graphs.",
            "status": "pending",
            "favorite": 0,
            "createdAt": "2025-02-11 12:10:00",
            "updatedAt": "2025-02-11 12:10:00"
        },
        {
            "taskId": 3,
            "userId": 12,
            "title": "Gym Workout",
            "description": "Leg day: squats, lunges, leg press.",
            "category": "Fitness",
            "priority": "Low",
            "dueDate": "2025-11-19",
            "dueTime": "4:30",
            "duration": "1h",
            "tags": "health,fitness",
            "reminder": "2025-02-17 06:30",
            "recurrence": "Daily",
            "hasSubtasks": 0,
            "notes": "",
            "status": "completed",
            "favorite": 0,
            "createdAt": "2025-02-09 06:00:00",
            "updatedAt": "2025-02-09 06:00:00"
        },
        {
            "taskId": 4,
            "userId": 12,
            "title": "Team Meeting",
            "description": "Weekly sync with development team.",
            "category": "Work",
            "priority": "High",
            "dueDate": "2025-02-19",
            "dueTime": "11:00",
            "duration": "1h",
            "tags": "team,meeting,office",
            "reminder": "2025-02-19 10:45",
            "recurrence": "Weekly",
            "hasSubtasks": 0,
            "notes": "Show progress of last sprint.",
            "status": "pending",
            "favorite": 1,
            "createdAt": "2025-02-10 09:30:00",
            "updatedAt": "2025-02-10 09:30:00"
        },
        {
            "taskId": 5,
            "userId": 12,
            "title": "Pay Electricity Bill",
            "description": "Pay before the due date to avoid late fees.",
            "category": "Bills",
            "priority": "High",
            "dueDate": "2025-02-16",
            "dueTime": "18:00",
            "duration": "10m",
            "tags": "bills,home",
            "reminder": "2025-02-16 17:00",
            "recurrence": "Monthly",
            "hasSubtasks": 0,
            "notes": "",
            "status": "pending",
            "favorite": 0,
            "createdAt": "2025-02-08 18:00:00",
            "updatedAt": "2025-02-08 18:00:00"
        },
        {
            "taskId": 6,
            "userId": 12,
            "title": "Call Parents",
            "description": "Check in and talk for at least 20 minutes.",
            "category": "Family",
            "priority": "Low",
            "dueDate": "2025-02-17",
            "dueTime": "20:00",
            "duration": "20m",
            "tags": "family,important",
            "reminder": "2025-02-17 19:45",
            "recurrence": "Daily",
            "hasSubtasks": 0,
            "notes": "",
            "status": "completed",
            "favorite": 1,
            "createdAt": "2025-02-09 20:00:00",
            "updatedAt": "2025-02-09 20:00:00"
        },
        {
            "taskId": 7,
            "userId": 12,
            "title": "Backup Laptop Files",
            "description": "Backup documents, projects, and images.",
            "category": "Maintenance",
            "priority": "Medium",
            "dueDate": "2025-02-21",
            "dueTime": "14:00",
            "duration": "1h",
            "tags": "backup,tech",
            "reminder": "",
            "recurrence": "None",
            "hasSubtasks": 1,
            "notes": "Use external hard drive.",
            "status": "pending",
            "favorite": 0,
            "createdAt": "2025-02-10 14:00:00",
            "updatedAt": "2025-02-10 14:00:00"
        },
        {
            "taskId": 8,
            "userId": 12,
            "title": "Read Book",
            "description": "Read 30 pages from ‘Atomic Habits’.",
            "category": "Hobby",
            "priority": "Low",
            "dueDate": "2025-02-17",
            "dueTime": "22:00",
            "duration": "45m",
            "tags": "reading,habit",
            "reminder": "",
            "recurrence": "Daily",
            "hasSubtasks": 0,
            "notes": "",
            "status": "pending",
            "favorite": 1,
            "createdAt": "2025-02-09 22:00:00",
            "updatedAt": "2025-02-09 22:00:00"
        },
        {
            "taskId": 9,
            "userId": 12,
            "title": "Medical Appointment",
            "description": "Dentist checkup and cleaning.",
            "category": "Health",
            "priority": "High",
            "dueDate": "2025-02-22",
            "dueTime": "09:00",
            "duration": "1h",
            "tags": "health,doctor",
            "reminder": "2025-02-22 08:00",
            "recurrence": "None",
            "hasSubtasks": 0,
            "notes": "",
            "status": "pending",
            "favorite": 0,
            "createdAt": "2025-02-12 09:00:00",
            "updatedAt": "2025-02-12 09:00:00"
        },
        {
            "taskId": 10,
            "userId": 12,
            "title": "Film YouTube Video",
            "description": "Record the intro and b-roll shots for new tech review.",
            "category": "Content",
            "priority": "Medium",
            "dueDate": "2025-02-19",
            "dueTime": "16:00",
            "duration": "3h",
            "tags": "youtube,video,content",
            "reminder": "",
            "recurrence": "None",
            "hasSubtasks": 1,
            "notes": "Charge camera batteries.",
            "status": "archived",
            "favorite": 0,
            "createdAt": "2025-02-10 16:00:00",
            "updatedAt": "2025-02-10 16:00:00"
        }
    ]


    populateTasks("#taskContainer", sampleTasks);

    $(document).on("click", ".ri-heart-line", function () {
        window.clickedHeart = this;
        const modal = new bootstrap.Modal(document.getElementById("favoriteTaskModal"));
        modal.show();
    });

    let pendingTaskId = null;
    let pendingCheckbox = null;

    // Checkbox click → decide which modal to open
    document.addEventListener("click", function (e) {
        const checkbox = e.target.closest(".task-checkbox");
        if (!checkbox) return;

        e.preventDefault(); // Stop instant toggle

        pendingTaskId = checkbox.dataset.id;
        pendingCheckbox = checkbox;

        const isChecked = checkbox.checked;

        // If checked → user is unchecking → show NOT DONE modal
        if (!isChecked) {
            const modal = new bootstrap.Modal(document.getElementById("markNotDoneModal"));
            modal.show();
        }
        // If unchecked → user is checking → show DONE modal
        else {
            const modal = new bootstrap.Modal(document.getElementById("markDoneModal"));
            modal.show();
        }
    });


    // ✔ Confirm Mark Done
    document.getElementById("confirmDoneBtn").addEventListener("click", function () {
        if (!pendingCheckbox) return;

        pendingCheckbox.checked = true;

        // TODO: update backend
        // updateTaskStatus(pendingTaskId, "completed");

        const modalEl = document.getElementById("markDoneModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        pendingTaskId = null;
        pendingCheckbox = null;
    });


    // ❌ Confirm Mark Not Done
    document.getElementById("confirmNotDoneBtn").addEventListener("click", function () {
        if (!pendingCheckbox) return;

        pendingCheckbox.checked = false;

        // TODO: update backend
        // updateTaskStatus(pendingTaskId, "pending");

        const modalEl = document.getElementById("markNotDoneModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        pendingTaskId = null;
        pendingCheckbox = null;
    });

    $("#confirmFavBtn").on("click", function () {

        // Close modal
        $("#favoriteTaskModal").modal("hide");

        // Convert outline → filled heart
        $(window.clickedHeart)
            .removeClass("ri-heart-line text-muted")
            .addClass("ri-heart-fill text-danger");

        // Add glow animation
        $(window.clickedHeart)
            .addClass("heart-glow");
        // Remove glow after animation ends
        setTimeout(() => {
            $(window.clickedHeart).removeClass("heart-glow");
        }, 600);

        // Clear reference
        window.clickedHeart = null;
    });


    $(document).on("click", ".ri-heart-fill", function () {
        window.clickedHeart = this;

        const modal = new bootstrap.Modal(document.getElementById("unfavoriteTaskModal"));
        modal.show();
    });

    $("#confirmUnfavBtn").on("click", function () {

        // Close modal
        $("#unfavoriteTaskModal").modal("hide");

        // Convert outline → filled heart
        $(window.clickedHeart)
            .addClass("ri-heart-line text-muted")
            .removeClass("ri-heart-fill text-danger");


        // Remove glow after animation ends


        // Clear reference
        window.clickedHeart = null;
    });

    $(document).on("click", ".ri-archive-line", function () {
        window.archived = this;
        const modal = new bootstrap.Modal(document.getElementById("archiveTaskModal"));
        modal.show();
    });

    $("#confirmArchiveBtn").on("click", function () {

        // Close modal
        $("#archiveTaskModal").modal("hide");

        displayToast("success", "Task archived successfully")
        // Remove glow after animation ends


        // Clear reference
    });

})