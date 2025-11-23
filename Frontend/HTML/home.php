<?php include("../Reusables/head.php"); ?>
<?php include("../Reusables/headBody.php"); ?>

<style>
.task-animate {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.55s ease, transform 0.55s ease;
}

.task-animate.show {
    opacity: 1;
    transform: translateY(0);
}

</style>

<!-- Main Content -->
<div class="container py-4">
  <div class="text-center mb-4">
    <h2>Hello, <?php echo htmlspecialchars($_SESSION['name']); ?> 👋</h2>
    <p class="text-muted">Let's make today productive!</p>
  </div>

  <div id="taskContainer"></div>

</div>

<!-- Spacer for fixed navbar -->
<div class="bottom-nav-spacer"></div>

<!-- Bottom Navigation Bar -->
<nav class="navbar bg-white border-top shadow-lg fixed-bottom">
  <div class="container-fluid">
    <div class="row w-100 align-items-center position-relative">

      <!-- Home -->
      <div class="col text-center">
        <a href="home.php" class="nav-link active text-decoration-none">
          <i class="ri-home-5-fill fs-4"></i>
          <div class="small">Home</div>
        </a>
      </div>

      <!-- Tasks -->
      <div class="col text-center">
        <a href="tasks.php" class="nav-link text-muted text-decoration-none">
          <i class="ri-todo-fill fs-4"></i>
          <div class="small">Tasks</div>
        </a>
      </div>

      <!-- Dashboard -->
      <div class="col text-center">
        <a href="dashboard.php" class="nav-link text-muted text-decoration-none">
          <i class="ri-bar-chart-2-fill fs-4"></i>
          <div class="small">Dashboard</div>
        </a>
      </div>

      <!-- Settings -->
      <div class="col text-center">
        <button class="nav-link text-muted border-0 bg-transparent" data-bs-toggle="offcanvas" data-bs-target="#settingsOffcanvas">
          <i class="ri-settings-2-fill fs-4"></i>
          <div class="small">Settings</div>
        </button>
      </div>

    </div>
  </div>
</nav>

<button id="global-add-btn"
  class="btn btn-success rounded-circle shadow-lg position-fixed d-flex align-items-center justify-content-center"
  style="
    bottom: 120px;
    right: 30px;
    width: 60px;
    height: 60px;
    z-index: 1050;
  " title="Add New"
  onclick="window.location.href='addNewTask.php'">
  <i class="ri-add-line" style="font-size: 24px;"></i>
</button>



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


<div class="modal fade" id="archiveTaskModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content rounded-4 border-0 shadow">

      <div class="modal-body text-center py-4">
        <div class="display-4 mb-3">📦</div>
        <h5 class="fw-bold mb-2">Archive This Task?</h5>
        <p class="text-muted small mb-3">You can restore it later from the archive section.</p>
        <div class="d-flex flex-row gap-2">
          <button class="btn btn-light w-100 rounded-pill " data-bs-dismiss="modal">Cancel</button>
        <button id="confirmArchiveBtn" class="btn btn-warning w-100 rounded-pill">
          Archive
        </button>
        </div>
      </div>

    </div>
  </div>
</div>


<!-- Mark as Done Modal (structure matches the favorite modal you provided) -->
<div class="modal fade" id="markDoneModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content rounded-4 border-0 shadow">

      <div class="modal-body text-center py-4">
        <div class="display-4 mb-3">✅</div>
        <h5 class="fw-bold mb-2">Mark as Done?</h5>
        <p class="text-muted small mb-3">This task will be marked as completed.</p>

        <div class="d-flex flex-row gap-2">
          <button class="btn btn-light w-100 rounded-pill" data-bs-dismiss="modal">Cancel</button>
          <button id="confirmDoneBtn" class="btn btn-success w-100 rounded-pill">
            Mark Done
          </button>
        </div>
      </div>

    </div>
  </div>
</div>

<div class="modal fade" id="markNotDoneModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content rounded-4 border-0 shadow">

      <div class="modal-body text-center py-4">
        <div class="display-4 mb-3">⏳</div>
        <h5 class="fw-bold mb-2">Mark as Not Done?</h5>
        <p class="text-muted small mb-3">This task will be moved back to pending.</p>

        <div class="d-flex flex-row gap-2">
          <button class="btn btn-light w-100 rounded-pill" data-bs-dismiss="modal">Cancel</button>
          <button id="confirmNotDoneBtn" class="btn btn-warning w-100 rounded-pill">
            Mark Not Done
          </button>
        </div>
      </div>

    </div>
  </div>
</div>




<script type="module" src="../JS/home.js"></script>
<?php include("../Reusables/foot.php"); ?>