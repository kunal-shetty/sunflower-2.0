<?php include("../Reusables/head.php"); ?>
<?php include("../Reusables/headBody.php"); ?>
<style>
  .task-menu-btn {
    background-color: transparent !important;
    box-shadow: none !important;
    border: none !important;
  }

  .task-menu-btn:focus,
  .task-menu-btn:hover,
  .task-menu-btn:active {
    background-color: transparent !important;
    box-shadow: none !important;
    outline: none !important;
  }

  .task-menu-btn i {
    color: #000000ff !important;
    /* grey icon */
    opacity: 1 !important;
  }


  .task-option-item {
    position: relative;
    overflow: hidden;
    cursor: pointer;
  }

  .full-ripple {
    position: absolute;
    inset: 0;
    /* covers the whole item */
    background: currentColor;
    /* matches icon color */
    opacity: 0;
    animation: fullRippleAnim 700ms ease-out;
    pointer-events: none;
    border-radius: inherit;
  }

  .task-ani {
    opacity: 0;
    transition: all 0.45s ease;
    transform: translateX(0);
  }

  /* Slide from left */
  .task-ani.slide-left {
    transform: translateX(-40px);
  }

  /* Slide from right */
  .task-ani.slide-right {
    transform: translateX(40px);
  }

  /* Final animated state */
  .task-ani.show {
    opacity: 1;
    transform: translateX(0);
  }


  .modal-open-with-canvas .offcanvas {
    z-index: 1040 !important;
    /* below modal (1050) */
  }

  .modal-backdrop {
    z-index: 1039 !important;
  }

  .active-filter {
    outline: 3px solid #00000020;
    box-shadow: 0 0 10px #00000030 !important;
    transform: scale(0.97);
  }




  @keyframes fullRippleAnim {
    0% {
      opacity: 0.15;
    }

    100% {
      opacity: 0;
    }
  }
</style>

<div class="container py-4 px-0">

  <div id="taskHeader" class="px-3 mb-3">
    <div class="px-3 mb-3 position-sticky" style="top:0; z-index:999; background:white;">
      <div class="d-flex align-items-center gap-2 w-100">

        <!-- Filter -->
        <button id="filterBtn" class="btn bg-primary btn-sm text-white shadow-sm flex-fill">
          <i class="ri-filter-3-line"></i>
        </button>

        <!-- Add -->
        <button id="addTaskBtn" class="btn bg-info btn-sm text-white shadow-sm flex-fill" href="window.location.hr">
          <i class="ri-add-line"></i>
        </button>

        <!-- Favorites -->
        <button id="favBtn" class="btn bg-danger btn-sm text-white shadow-sm flex-fill">
          <i class="ri-heart-2-line"></i>
        </button>

        <!-- Archive -->
        <button id="archiveBtn" class="btn bg-warning btn-sm text-white shadow-sm flex-fill">
          <i class="ri-archive-line"></i>
        </button>

        <!-- Favorites -->
        <button id="urgentPriority" class="btn btn-sm text-white shadow-sm flex-fill" style="background:#ff0000;">
          <i class="ri-flag-line"></i>
        </button>


      </div>

    </div>

  </div>


  <!-- Task list container -->
  <div id="taskList">

  </div>

</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="filterOffcanvas"
  style="width: 100%; border-radius: 20px 0 0 20px;" data-bs-backdrop="true">

  <!-- Header -->
  <div class="offcanvas-header bg-white d-flex align-items-center border-bottom">
    <h5 class="offcanvas-title fw-bold m-0 d-flex align-items-center">
      <i class="ri-filter-3-line fs-5 me-3 text-black"></i>
      Filters
    </h5>
    <button type="button" class="btn-close text-muted ms-auto" data-bs-dismiss="offcanvas"></button>
  </div>

  <div class="offcanvas-body px-4">

    <!-- Status Filter -->
    <div class="mb-4">
      <div class="fw-semibold mb-2 text-dark">Status</div>

      <div class="d-flex align-items-center gap-4 flex-wrap">
        <div class="d-flex align-items-center">
          <input type="checkbox" id="filterDone" class="form-check-input me-2">
          <label for="filterDone" class="text-dark">Completed</label>
        </div>

        <div class="d-flex align-items-center">
          <input type="checkbox" id="filterPending" class="form-check-input me-2">
          <label for="filterPending" class="text-dark">Pending</label>
        </div>
      </div>
    </div>

    <!-- Priority Filter -->
    <div class="mb-4">
      <div class="fw-semibold mb-2 text-dark">Priority</div>

      <div class="d-flex align-items-center gap-4 flex-wrap">
        <div class="d-flex align-items-center">
          <input type="checkbox" id="prioHigh" class="form-check-input me-2">
          <label for="prioHigh" class="text-dark">High</label>
        </div>

        <div class="d-flex align-items-center">
          <input type="checkbox" id="prioMedium" class="form-check-input me-2">
          <label for="prioMedium" class="text-dark">Medium</label>
        </div>

        <div class="d-flex align-items-center">
          <input type="checkbox" id="prioLow" class="form-check-input me-2">
          <label for="prioLow" class="text-dark">Low</label>
        </div>
      </div>
    </div>


    <!-- 📅 Date Filter -->
    <div class="mb-4">
      <div class="fw-semibold mb-2 text-dark">Due Date</div>

      <div class="row g-3">

        <div class="col-6">
          <label class="text-dark mb-1">From</label>
          <input type="date" id="dateFrom" class="form-control rounded-3">
        </div>

        <div class="col-6">
          <label class="text-dark mb-1">To</label>
          <input type="date" id="dateTo" class="form-control rounded-3">
        </div>

      </div>
    </div>




    <!-- 📁 Archive / Fav / Deleted Filters -->
    <div class="mb-4">
      <div class="fw-semibold mb-2 text-dark">Additional</div>

      <div class="d-flex align-items-center gap-4 flex-wrap">

        <div class="d-flex align-items-center">
          <input type="checkbox" id="filterFav" class="form-check-input me-2">
          <label for="filterFav" class="text-dark">Favourites</label>
        </div>

        <div class="d-flex align-items-center">
          <input type="checkbox" id="filterArchive" class="form-check-input me-2">
          <label for="filterArchive" class="text-dark">Archived</label>
        </div>

        <div class="d-flex align-items-center">
          <input type="checkbox" id="filterDeleted" class="form-check-input me-2">
          <label for="filterDeleted" class="text-dark">Deleted</label>
        </div>

      </div>
    </div>


    <!-- Buttons at Bottom -->
    <div class="mt-auto pt-3">
      <div class="d-flex flex-column gap-2">
        <button id="applyFilterBtn" class="btn bg-primary text-white rounded-pill py-2" data-bs-dismiss="offcanvas">
          Apply Filters
        </button>

        <button id="resetFilterBtn" class="btn bg-light rounded-pill py-2 border">
          Reset
        </button>
      </div>
    </div>

  </div>
</div>

<!-- Bottom Offcanvas (Spotify Style Task Options) -->
<div class="offcanvas offcanvas-bottom" tabindex="-1" id="ctaTaskOption"
  style="height:auto; border-radius:20px 20px 0 0;" data-bs-backdrop="true">

  <!-- Header -->
  <div class="offcanvas-header bg-white rounded-top d-flex align-items-center">
    <h5 class="offcanvas-title fw-bold m-0 d-flex align-items-center">
      <i class="ri-menu-line fs-5 me-3 text-black"></i>
      Task Options
    </h5>
    <button type="button" class="btn-close text-muted ms-auto" data-bs-dismiss="offcanvas"></button>
  </div>

  <div class="offcanvas-body p-0">

    <div class="mb-4">

      <!-- View -->
      <div class="task-option-item d-flex align-items-center text-dark py-3 px-5" id="optViewTask">
        <i class="ri-eye-line fs-5 me-3" style="color:#3b82f6;"></i>
        <div class="flex-grow-1">
          <div class="fw-semibold">View Task</div>
          <small class="text-muted">See task details</small>
        </div>
        <i class="ri-arrow-right-s-line fs-5 text-muted"></i>
      </div>

      <!-- Edit -->
      <div class="task-option-item d-flex align-items-center text-dark py-3 px-5" id="optEditTask">
        <i class="ri-edit-line fs-5 me-3" style="color:#6366f1;"></i>
        <div class="flex-grow-1">
          <div class="fw-semibold">Edit Task</div>
          <small class="text-muted">Modify this task</small>
        </div>
        <i class="ri-arrow-right-s-line fs-5 text-muted"></i>
      </div>

      <!-- Archive -->
      <div class="task-option-item d-flex align-items-center text-dark py-3 px-5" id="optAddArchive">
        <i class="ri-archive-line fs-5 me-3" style="color:#f59e0b;"></i>
        <div class="flex-grow-1">
          <div class="fw-semibold">Add to Archive</div>
          <small class="text-muted">Move this task to archive</small>
        </div>
        <i class="ri-arrow-right-s-line fs-5 text-muted"></i>
      </div>

      <!-- Favorite -->
      <div class="task-option-item d-flex align-items-center text-dark py-3 px-5" id="optToggleFav">
        <i class="ri-heart-line fs-5 me-3" style="color:#ff00ea;"></i>
        <div class="flex-grow-1">
          <div class="fw-semibold">Add to Favorites</div>
          <small class="text-muted">Mark as favorite</small>
        </div>
        <i class="ri-arrow-right-s-line fs-5 text-muted"></i>
      </div>

      <!-- Set Priority -->
      <div class="task-option-item d-flex align-items-center text-dark py-3 px-5" id="optSetPriority">
        <i class="ri-flag-line fs-5 me-3" style="color:#ef4444;"></i>
        <div class="flex-grow-1">
          <div class="fw-semibold">Set Priority</div>
          <small class="text-muted">High, Medium or Low</small>
        </div>
        <i class="ri-arrow-right-s-line fs-5 text-muted"></i>
      </div>

      <!-- Modify Due -->
      <div class="task-option-item d-flex align-items-center text-dark py-3 px-5" id="optModifyDue">
        <i class="ri-calendar-event-line fs-5 me-3" style="color:#a855f7;"></i>
        <div class="flex-grow-1">
          <div class="fw-semibold">Modify Due Date & Time</div>
          <small class="text-muted">Change task deadline</small>
        </div>
        <i class="ri-arrow-right-s-line fs-5 text-muted"></i>
      </div>

      <!-- Add Reminder -->
      <div class="task-option-item d-flex align-items-center text-dark py-3 px-5" id="optAddReminder">
        <i class="ri-alarm-line fs-5 me-3" style="color:#14b8a6;"></i>
        <div class="flex-grow-1">
          <div class="fw-semibold">Add Reminder</div>
          <small class="text-muted">Set a reminder notification</small>
        </div>
        <i class="ri-arrow-right-s-line fs-5 text-muted"></i>
      </div>

      <!-- Delete -->
      <div class="task-option-item d-flex align-items-center text-dark py-3 px-5" id="optDeleteTask">
        <i class="ri-delete-bin-line fs-5 me-3" style="color:#e11d48;"></i>
        <div class="flex-grow-1">
          <div class="fw-semibold text-danger">Delete Task</div>
          <small class="text-muted">Permanently remove this task</small>
        </div>
        <i class="ri-arrow-right-s-line fs-5 text-muted"></i>
      </div>

    </div>

  </div>

</div>


<div class="modal fade" id="priorityModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content rounded-4 border-0 shadow">

      <div class="modal-body text-center py-4">
        <div class="display-4 mb-3">🚩</div>
        <h5 class="fw-bold mb-2">Set Priority</h5>
        <p class="text-muted small mb-3">Choose priority level</p>

        <!-- Row 1: High / Medium / Low -->
        <div class="d-flex flex-row gap-2 mb-3">

          <button class="btn btn-danger flex-fill" id="HighBtn">
            High
          </button>

          <button class="btn btn-warning flex-fill" id="MediumBtn">
            Medium
          </button>

          <button class="btn btn-success flex-fill" id="LowBtn">
            Low
          </button>

        </div>

        <!-- Row 2: Urgent -->
        <div class="d-flex">
          <button class="btn btn-dark w-100" id="UrgentBtn">
            ⚡ Urgent
          </button>
        </div>

      </div>

    </div>
  </div>
</div>


<div class="modal fade" id="favoriteTaskModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content rounded-4 border-0 shadow">

      <div class="modal-body text-center py-4">
        <div class="display-4 mb-3">❤️</div>
        <h5 class="fw-bold mb-2">Mark as Favorite?</h5>
        <p class="text-muted small mb-3">This task will be added to your favorites list.</p>
        <div class="d-flex flex-row gap-2">
          <button class="btn btn-light w-100 rounded-pill " data-bs-dismiss="modal">Cancel</button>
        <button id="confirmFavBtn" class="btn btn-danger w-100 rounded-pill">
          Confirm
        </button>
        </div>
      </div>

    </div>
  </div>
</div>

<!-- Unfavorite Task Modal -->
<div class="modal fade" id="unfavoriteTaskModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content rounded-4 border-0 shadow">

      <div class="modal-body text-center py-4">
        <i class="ri-heart-line text-danger fs-1 mb-3"></i> 
         <h5 class="fw-bold mb-2">Remove from favorites?</h5>
        <small class="text-muted small mb-3">You can always favorite it again later.</small>
        <div class="d-flex flex-row gap-2 mt-3">
          <button class="btn btn-light w-100 rounded-pill " data-bs-dismiss="modal">Cancel</button>
        <button id="confirmUnfavBtn" class="btn btn-danger w-100 rounded-pill">
          Confirm
        </button>
        </div>
      </div>

    </div>
  </div>
</div>
  

<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script type="module" src="../JS/tasks.js"></script>
<?php include("../Reusables/foot.php"); ?>