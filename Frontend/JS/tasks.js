import { capitalize } from "../Reusables/helper";

function taskPopulate(tasks = []) {
    const $taskList = $("#taskList");
    $taskList.empty();

    if (!tasks.length) {
        $taskList.html(`
            <div class="text-center py-5 px-3">
                <div style="font-size: 4rem;">📝</div>
                <h5 class="fw-bold mt-3 mb-2" style="color: #2C3E50;">No Tasks</h5>
                <p class="text-muted small">Tap + to add your first task</p>
            </div>
        `);
        return;
    }

    // -----------------------------
    // 🔥 SORTING BASED ON YOUR ORDER
    // -----------------------------
    const sortedTasks = [
        ...tasks.filter(t => t.isDeleted != 1 && t.isArchived != 1), // Normal
        ...tasks.filter(t => t.isArchived == 1 && t.isDeleted != 1),  // Archived
        ...tasks.filter(t => t.isDeleted == 1)                        // Deleted
    ];
    // -----------------------------

    const getArchiveStyle = task =>
        task.isArchived == 1 ? "background:#FFF8D6;" : "";

    const getDeletedStyle = task =>
        task.isDeleted == 1 ? "filter:grayscale(1);opacity:0.35;pointer-events:none;" : "";

    sortedTasks.forEach((task, index) => {
        const isCompleted = task.status === "completed";
        const isDeleted = task.isDeleted == 1;
        const isArchived = task.isArchived == 1;

        const priorityDot = getPriorityDot(task.priority);
        const isFav = task.favorite == 1 
            ? "ri-heart-fill text-danger" 
            : "ri-heart-line text-muted";

        const tags = task.tags ? task.tags.split(",").map(t => t.trim()) : [];

        const cardStyle = `
            border-radius:16px;
            border-left:4px solid ${getPriorityColor(task.priority)};
            ${getArchiveStyle(task)}
            ${getDeletedStyle(task)}
        `;

        const taskHTML = `
        <div class="task-item mb-3 px-3 task-ani ${index % 2 === 0 ? "slide-left" : "slide-right"}"
             data-id="${task.taskId}"
             data-ani-index="${index}">

            <div class="card shadow-sm border-0" style="${cardStyle}">
                <div class="card-body p-4">

                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="d-flex align-items-start gap-3 flex-grow-1 me-3">

                            <!-- Checkbox -->
                            <input type="checkbox"
                                   class="form-check-input mt-1 task-checkbox"
                                   ${isCompleted ? "checked" : ""}
                                   ${isDeleted ? "disabled" : ""}
                                   data-id="${task.taskId}"
                                   style="width:20px;height:20px;cursor:pointer;">
                            
                            <div class="flex-grow-1">

                                <div class="d-flex align-items-center gap-2 mb-2">
                                    <h6 class="mb-0 fw-bold
                                        ${isCompleted ? "text-decoration-line-through text-muted" : "text-dark"}">
                                        ${task.title}
                                    </h6>

                                    ${priorityDot}

                                    <i class="${isFav} action-fav"
                                       data-id="${task.taskId}"
                                       ${isDeleted ? "style='pointer-events:none;opacity:0.5;'" : "style='cursor:pointer;font-size:1.1rem;'"} >
                                    </i>
                                </div>

                                <div class="d-flex align-items-center gap-2 text-muted small">
                                    <i class="ri-calendar-line"></i>
                                    <span>${formatDate(task.dueDate)}</span>

                                    ${task.dueTime ? `
                                        <i class="ri-time-line ms-2"></i>
                                        <span>${convertToAmPmRange(task.dueTime)}</span>
                                    ` : ""}
                                </div>
                            </div>
                        </div>

                        <!-- Dropdown -->
                        <div class="dropdown">
                            <button class="btn btn-sm btn-link p-0 task-menu-btn"
                                data-bs-toggle="offcanvas"
                                data-bs-target="#ctaTaskOption"
                                data-id="${task.taskId}"
                                data-fav="${task.favorite}"
                                ${isDeleted ? "disabled style='opacity:0.4;'" : ""}>
                                <i class="ri-list-unordered fs-5"></i>
                            </button>
                        </div>
                    </div>

                    ${tags.length ? `
                        <div class="mb-3">
                            <div class="d-flex flex-wrap gap-1">
                                ${tags.map(tag => `
                                    <span class="badge bg-light text-dark border px-2 py-1 small">
                                        <i class="ri-price-tag-3-line me-1"></i>${capitalize(tag)}
                                    </span>
                                `).join("")}
                            </div>
                        </div>
                    ` : ""}

                    ${task.description ? `
                        <p class="small text-muted mb-3" style="line-height:1.4;">
                            ${task.description}
                        </p>
                    ` : ""}

                    <div class="pt-3 border-top">
                        <span class="small fw-semibold 
                            ${isCompleted ? "text-success" : isDeleted ? "text-muted" : "text-warning"}">

                            <i class="${isCompleted ? "ri-checkbox-circle-fill" : "ri-time-line"} me-1"></i>
                            ${isCompleted ? "Completed" : "Pending"}

                            ${isArchived ? " • Archived" : ""}
                            ${isDeleted ? " • Deleted" : ""}
                        </span>
                    </div>

                </div>
            </div>
        </div>

        ${index < sortedTasks.length - 1 ? '<hr class="divider">' : ""}
        `;

        $taskList.append(taskHTML);
    });

    // Animation stagger
    $(".task-ani").each(function (i) {
        setTimeout(() => $(this).addClass("show"), i * 10);
    });
}



function applyFilters(tasks) {

    // ⭐ QUICK FILTERS (override everything)
    if (quickFilter === "fav") {
        return tasks.filter(t => t.favorite == 1);
    }
    if (quickFilter === "archive") {
        return tasks.filter(t => t.isArchived == 1);
    }
    if (quickFilter === "urgent") {
        return tasks.filter(t => t.priority === "Urgent");
    }

    // ⭐ NORMAL FILTERS
    const done = $("#filterDone").is(":checked");
    const pending = $("#filterPending").is(":checked");

    const prioHigh = $("#prioHigh").is(":checked");
    const prioMedium = $("#prioMedium").is(":checked");
    const prioLow = $("#prioLow").is(":checked");

    const fav = $("#filterFav").is(":checked");
    const archive = $("#filterArchive").is(":checked");
    const deleted = $("#filterDeleted").is(":checked");

    const dateFrom = $("#dateFrom").val();
    const dateTo = $("#dateTo").val();

    return tasks.filter(task => {

        // ⭐ STATUS (OR logic)
        if (done || pending) {
            const statusMatch =
                (done && task.status === "completed") ||
                (pending && task.status === "pending");

            if (!statusMatch) return false;
        }

        // ⭐ PRIORITY (OR logic)
        if (prioHigh || prioMedium || prioLow) {
            const prioMatch =
                (prioHigh && task.priority === "High") ||
                (prioMedium && task.priority === "Medium") ||
                (prioLow && task.priority === "Low");

            if (!prioMatch) return false;
        }

        // ⭐ ADDITIONAL (AND logic)
        if (fav && task.favorite != 1) return false;
        if (archive && task.isArchived != 1) return false;
        if (deleted && task.isDeleted != 1) return false;

        // ⭐ DATE RANGE
        const due = parseDate(task.dueDate);

        if (dateFrom) {
            const from = new Date(dateFrom);
            if (due < from) return false;
        }

        if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59);
            if (due > to) return false;
        }


        return true;
    });
}

function parseDate(dateStr) {
    if (!dateStr) return null;

    // If format is DD-MM-YYYY
    if (dateStr.includes("-")) {
        const [day, month, year] = dateStr.split("-");
        return new Date(`${year}-${month}-${day}`);
    }

    // If already ISO YYYY-MM-DD
    return new Date(dateStr);
}


// Global
let quickFilter = null;

// Handle Quick Filters
function setQuickFilter(type, btnId, data) {

    if (quickFilter === type) {
        // If already active → unselect
        quickFilter = null;

        // Remove highlight
        $(`#${btnId}`).removeClass("active-filter");

    } else {
        // Set new quick filter
        quickFilter = type;

        // Remove active from all buttons
        $("#favBtn, #archiveBtn, #urgentPriority").removeClass("active-filter");

        // Add active state to the clicked one
        $(`#${btnId}`).addClass("active-filter");
    }

    // Refresh task list using your filter logic
    const filtered = applyFilters(data);
    taskPopulate(filtered);
}



function getPriorityColor(priority) {
    const colors = {
        'High': '#dc3545',
        'Medium': '#ffc107',
        'Low': '#198754'
    };
    return colors[priority] || '#6c757d';
}

function getPriorityDot(priority) {
    const colors = {
        'High': 'danger',
        'Medium': 'warning',
        'Low': 'success'
    };
    const color = colors[priority] || 'secondary';
    return `<span class="badge bg-${color} rounded-pill" style="width: 8px; height: 8px; padding: 0;" title="${priority} priority"></span>`;
}

function formatDate(dateString) {
    if (!dateString) return 'No date set';
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function convertToAmPmRange(timeString) {
    if (!timeString) return '';

    try {
        const [hours, minutes] = timeString.split(':');
        let h = parseInt(hours);
        let m = minutes;

        const period = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12;

        return `${h}:${m} ${period}`;

    } catch (error) {
        return timeString;
    }
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
        "dueDate": "2025-02-18",
        "dueTime": "17:30",
        "duration": "30m",
        "tags": "home,shopping",
        "reminder": "2025-02-18 17:00",
        "recurrence": "None",
        "hasSubtasks": 0,
        "notes": "Use discount coupons",
        "status": "pending",
        "favorite": 1,
        "isArchived": 0,
        "isDeleted": 1,
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
        "dueDate": "2025-02-20",
        "dueTime": "23:59",
        "duration": "2h",
        "tags": "college,project,report",
        "reminder": "2025-02-20 20:00",
        "recurrence": "None",
        "hasSubtasks": 1,
        "notes": "Attach PDFs and graphs.",
        "status": "pending",
        "favorite": 0,
        "isArchived": 0,
        "isDeleted": 0,
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
        "dueDate": "2025-02-17",
        "dueTime": "07:00",
        "duration": "1h",
        "tags": "health,fitness",
        "reminder": "2025-02-17 06:30",
        "recurrence": "Daily",
        "hasSubtasks": 0,
        "notes": "",
        "status": "completed",
        "favorite": 0,
        "isArchived": 0,
        "isDeleted": 0,
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
        "isArchived": 0,
        "isDeleted": 0,
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
        "isArchived": 0,
        "isDeleted": 0,
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
        "isArchived": 0,
        "isDeleted": 0,
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
        "isArchived": 0,
        "isDeleted": 0,
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
        "isArchived": 0,
        "isDeleted": 0,
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
        "isArchived": 0,
        "isDeleted": 0,
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
        "status": "pending",   // fixed from "archived"
        "favorite": 0,
        "isArchived": 1,       // archived as requested
        "isDeleted": 0,
        "createdAt": "2025-02-10 16:00:00",
        "updatedAt": "2025-02-10 16:00:00"
    }
];

    taskPopulate(sampleTasks); // where taskArray is your JSON list


    // Bind buttons
    $("#favBtn").on("click", () => setQuickFilter("fav", "favBtn", sampleTasks));
    $("#archiveBtn").on("click", () => setQuickFilter("archive", "archiveBtn", sampleTasks));
    $("#urgentPriority").on("click", () => setQuickFilter("urgent", "urgentPriority", sampleTasks));

    $(document).prop("title", `Your Tasks (${sampleTasks.length})`);

    // Priority Modal
    $(document).on("click", "#optSetPriority", function () {
        setTimeout(() => {
            const modal = new bootstrap.Modal(document.getElementById("priorityModal"));
            modal.show();
        }, 140);
    });


    $("#addTaskBtn").on("click", () => {
        window.location.href = "addNewTask.php";
    });


    $(document).on("click", "#filterBtn", function () {
        setTimeout(() => {
            const modal = new bootstrap.Offcanvas(document.getElementById("filterOffcanvas"));
            modal.show();
        }, 140);
    });

    // Favorite Modal
    $(document).on("click", ".ri-heart-line", function () {
        window.clickedHeart = this;
        setTimeout(() => {
            const modal = new bootstrap.Modal(document.getElementById("favoriteTaskModal"));
            modal.show();
        }, 140);
    });

    // Unfavorite Modal
    $(document).on("click", ".ri-heart-fill", function () {
        window.clickedHeart = this;
        setTimeout(() => {
            const modal = new bootstrap.Modal(document.getElementById("unfavoriteTaskModal"));
            modal.show();
        }, 140);
    });



    // When any modal opens, add dark overlay on offcanvas too
    $(document).on("show.bs.modal", ".modal", function () {
        $("body").addClass("modal-open-with-canvas");
    });

    // Remove when closed
    $(document).on("hidden.bs.modal", ".modal", function () {
        $("body").removeClass("modal-open-with-canvas");
    });

    $("#applyFilterBtn").on("click", function () {
        const filtered = applyFilters(sampleTasks); // sampleTasks = your original tasks list
        taskPopulate(filtered);
    });

    $("#resetFilterBtn").on("click", function () {
        // Uncheck all
        $("#filterOffcanvas input[type='checkbox']").prop("checked", false);

        // Clear dates
        $("#dateFrom").val("");
        $("#dateTo").val("");

        // Load default task list
        taskPopulate(sampleTasks);
    });

// Handle checkbox toggle
$(document).on("change", ".task-checkbox", function () {
    const taskId = $(this).data("id");
    const isChecked = $(this).is(":checked");

    // Update the task locally
    const task = sampleTasks.find(t => t.taskId == taskId);
    if (task) {
        task.status = isChecked ? "completed" : "pending";
    }

    taskPopulate(sampleTasks);

});

    $(".task-option-item").on("click", function () {
        const $item = $(this);

        // Create the full ripple overlay
        const $ripple = $("<span class='full-ripple'></span>");

        // Match ripple color to the left icon
        const iconColor = $item.find("i").first().css("color");
        $ripple.css("background", iconColor);

        $item.append($ripple);

        // Remove after animation
        setTimeout(() => $ripple.remove(), 350);
    });


})