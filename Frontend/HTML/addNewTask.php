<?php include("../Reusables/head.php"); ?>
<?php include("../Reusables/headBody.php"); ?>

<style>
    /* Alice Blue, Light Yellow, Orange Theme */
    :root {
        --alice-blue: #F0F8FF;
        --light-yellow: #FFFFE0;
        --soft-yellow: #FFF9E6;
        --orange: #FF8C42;
        --dark-orange: #FF6B1A;
        --light-orange: #FFB380;
        --text-dark: #2C3E50;
        --border-color: #FFD1A6;
    }

    #addTaskModal .modal-content {
        background: linear-gradient(135deg, var(--alice-blue) 0%, var(--soft-yellow) 100%);
        border: 2px solid var(--orange);
    }

    #addTaskModal .modal-header {
        background: linear-gradient(90deg, var(--orange) 0%, var(--dark-orange) 100%);
        color: white;
        padding: 1.5rem;
        border-bottom: none;
    }

    #addTaskModal .modal-title {
        font-weight: 700;
        font-size: 1.5rem;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
    }

    #addTaskModal .modal-body {
        background-color: rgba(255, 255, 255, 0.7);
        padding: 2rem;
    }

    #addTaskModal .form-label {
        color: var(--text-dark);
        font-weight: 600;
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
    }

    #addTaskModal .form-control,
    #addTaskModal .form-select {
        border: 2px solid var(--border-color);
        border-radius: 12px;
        background-color: var(--alice-blue);
        transition: all 0.3s ease;
        color: var(--text-dark);
    }

    #addTaskModal .form-control:focus,
    #addTaskModal .form-select:focus {
        border-color: var(--orange);
        box-shadow: 0 0 0 0.25rem rgba(255, 140, 66, 0.25);
        background-color: white;
    }

    #addTaskModal .form-control::placeholder {
        color: #95a5a6;
    }

    #addTaskModal .modal-footer {
        background: linear-gradient(180deg, rgba(255, 255, 224, 0.3) 0%, rgba(240, 248, 255, 0.5) 100%);
        border-top: 2px solid var(--light-orange);
        padding: 1.5rem;
        border-radius: 0 0 18px 18px;
    }

    #addTaskModal .btn-primary {
        background: linear-gradient(90deg, var(--orange) 0%, var(--dark-orange) 100%);
        border: none;
        border-radius: 12px;
        padding: 0.8rem 2rem;
        font-weight: 600;
        font-size: 1.1rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(255, 140, 66, 0.3);
    }

    #addTaskModal .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 140, 66, 0.4);
        background: linear-gradient(90deg, var(--dark-orange) 0%, var(--orange) 100%);
    }

    #addTaskModal .btn-primary:active {
        transform: translateY(0);
    }

    #addTaskModal .invalid-feedback {
        color: #e74c3c;
        font-weight: 500;
    }

    /* Priority and Category badges styling */
    .priority-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 600;
    }

    /* Custom checkbox styling */
    .form-check-input:checked {
        background-color: var(--orange);
        border-color: var(--orange);
    }

    /* Tags input styling */
    .tag-input-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        padding: 0.5rem;
        border: 2px solid var(--border-color);
        border-radius: 12px;
        background-color: var(--alice-blue);
        min-height: 50px;
    }

    .tag-badge {
        background-color: var(--orange);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
    }

    .tag-remove {
        cursor: pointer;
        font-weight: bold;
    }
</style>

<div class="modal" id="addTaskModal" data-bs-backdrop="static" tabindex="-1">
    <div class="modal-dialog modal-fullscreen">
        <div class="modal-content">


            <div class="modal-body py-0 px-4" style="overflow-y:auto;">

                <form id="task-form" class="needs-validation pt-6"
                    novalidate>

                    <input type="hidden" name="action" value="add">

                    <!-- Title -->
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Task Title *</label>
                        <input type="text" class="form-control form-control-lg" id="task-title" name="title"
                            placeholder="Enter task title" required>
                        <div class="invalid-feedback">Please enter a title.</div>
                    </div>

                    <!-- Description -->
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Description</label>
                        <textarea class="form-control form-control-lg" id="task-desc" rows="4" name="description"
                            placeholder="Enter task details and notes"></textarea>
                    </div>

                    <!-- Category -->
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Category</label>
                        <select class="form-select form-control-lg" id="category" name="category">
                            <option value="">Select category</option>
                            <option value="work">💼 Work</option>
                            <option value="personal">👤 Personal</option>
                            <option value="shopping">🛒 Shopping</option>
                            <option value="health">❤️ Health</option>
                            <option value="finance">💰 Finance</option>
                            <option value="education">📚 Education</option>
                            <option value="home">🏠 Home</option>
                            <option value="other">📌 Other</option>
                        </select>
                    </div>

                    <!-- Priority -->
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Priority *</label>
                        <select class="form-select form-control-lg" id="priority" required name="priority">
                            <option value="">Select priority</option>
                            <option value="low">🟢 Low</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="high">🔴 High</option>
                            <option value="urgent">⚠️ Urgent</option>
                        </select>
                        <div class="invalid-feedback">Please choose a priority.</div>
                    </div>

                    <!-- Due Date & Time -->
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Due Date</label>
                            <input type="date" class="form-control form-control-lg" id="due-date" name="dueDate">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Due Time</label>
                            <input type="time" class="form-control form-control-lg" id="due-time" name="dueTime">
                        </div>
                    </div>

                    <!-- Estimated Duration -->
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Estimated Duration (minutes)</label>
                        <input type="number" class="form-control form-control-lg" id="duration" name="duration"
                            placeholder="e.g., 30" min="1">
                    </div>

                    <!-- Tags -->
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Tags</label>
                        <input type="text" class="form-control form-control-lg" id="tags-input"
                            placeholder="Type tag and press Enter" name="tags">
                        <small class="text-muted">Press Enter to add tags</small>
                    </div>

                    <!-- Reminder -->
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Reminder</label>
                        <select class="form-select form-control-lg" id="reminder" name="reminder">
                            <option value="">No reminder</option>
                            <option value="15">15 minutes before</option>
                            <option value="30">30 minutes before</option>
                            <option value="60">1 hour before</option>
                            <option value="1440">1 day before</option>
                        </select>
                    </div>

                    <!-- Recurrence -->
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Repeat</label>
                        <select class="form-select form-control-lg" id="recurrence" name="recurrence">
                            <option value="none">Does not repeat</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <!-- Subtasks Checkbox -->
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="has-subtasks" name="hasSubtasks">
                            <label class="form-check-label fw-semibold" for="has-subtasks">
                                This task has subtasks
                            </label>
                        </div>
                    </div>

                    <!-- Notes -->
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Additional Notes</label>
                        <textarea class="form-control form-control-lg" id="notes" rows="2" name="notes"
                            placeholder="Any additional information or links"></textarea>
                    </div>

                    <!-- Status -->
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Status *</label>
                        <select class="form-select form-control-lg" id="status" required name="status">
                            <option value="0" selected>⏳ Pending</option>
                            <option value="1">✅ Completed</option>
                            <option value="2">🚧 In Progress</option>
                        </select>
                        <div class="invalid-feedback">Please select status.</div>
                    </div>

                </form>

            </div>

            <div class="modal-footer">
                <button class="btn btn-primary w-100" type="button" form="task-form">
                    💾 Save Task
                </button>
            </div>

        </div>
    </div>
</div>

<script type="module" src="../JS/addNewTask.js"></script>
<?php include("../Reusables/foot.php"); ?>