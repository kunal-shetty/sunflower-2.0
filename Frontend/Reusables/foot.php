</div>
</div>
<!-- Layout page End -->
</div>

<!-- Overlay -->
<div class="layout-overlay layout-menu-toggle"></div>

<!-- Drag Target Area To SlideIn Menu On Small Screens -->
<div class="drag-target"></div>
</div>
<!-- Layout wrapper End -->

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>

<!-- Spacer for fixed navbar -->
<div class="bottom-nav-spacer"></div>

<!-- Bottom Navigation Bar -->
<nav class="navbar bg-white border-top shadow-lg fixed-bottom">
  <div class="container-fluid">
    <div class="row w-100 align-items-center position-relative">

      <!-- Home -->
      <div class="col text-center">
        <a href="home.php" class="nav-link text-muted text-decoration-none">
          <i class="ri-home-5-fill fs-4"></i>
          <div class="small">Home</div>
        </a>
      </div>

      <!-- Tasks -->
      <div class="col text-center">
        <a href="tasks.php" class="nav-link text-decoration-none">
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

<!-- Settings Offcanvas -->

<div class="offcanvas offcanvas-end" tabindex="-1" id="settingsOffcanvas">
  <div class="offcanvas-header bg-white">
    <h5 class="offcanvas-title fw-bold">
      <i class="ri-settings-3-line me-2"></i>Settings
    </h5>
    <button type="button" class="btn-close text-muted" data-bs-dismiss="offcanvas"></button>
  </div>

  <div class="offcanvas-body">

    <!-- User Profile Card -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body text-center">
        <div class="position-relative d-inline-block mb-3">
          <img src="https://ui-avatars.com/api/?name=<?php echo urlencode($_SESSION['name']); ?>&background=0D6EFD&color=fff&size=200" 
               alt="Profile" 
               class="rounded-circle profile-avatar">
        
        </div>
        <h5 class="mb-1 fw-bold"><?php echo htmlspecialchars($_SESSION['name']); ?></h5>
        <p class="text-muted small mb-0">
          <i class="ri-mail-line me-1"></i><?php echo htmlspecialchars($_SESSION['email'] ?? 'user@example.com'); ?>
        </p>
      </div>
    </div>

    <!-- Profile Section -->
    <div class="mb-4">
      <h6 class="text-uppercase text-muted small fw-bold mb-3">
        <i class="ri-user-settings-line me-1"></i> Account
      </h6>
      
      <a href="profile.php" class="d-flex align-items-center text-decoration-none text-dark settings-link">
        <i class="ri-user-line fs-5 me-3 text-primary"></i>
        <div class="flex-grow-1">
          <div class="fw-semibold">Edit Profile</div>
          <small class="text-muted">Update your information</small>
        </div>
        <i class="ri-arrow-right-s-line fs-5 text-muted"></i>
      </a>
      
      <a href="change-password.php" class="d-flex align-items-center text-decoration-none text-dark settings-link">
        <i class="ri-lock-line fs-5 me-3 text-primary"></i>
        <div class="flex-grow-1">
          <div class="fw-semibold">Change Password</div>
          <small class="text-muted">Update your password</small>
        </div>
        <i class="ri-arrow-right-s-line fs-5 text-muted"></i>
      </a>
    </div>

    <div class="section-divider"></div>

    <!-- App Preferences -->
    <div class="mb-4">
      <h6 class="text-uppercase text-muted small fw-bold mb-3">
        <i class="ri-palette-line me-1"></i> Preferences
      </h6>
      
      <div class="d-flex align-items-center settings-link">
        <i class="ri-moon-line fs-5 me-3 text-primary"></i>
        <div class="flex-grow-1">
          <div class="fw-semibold">Dark Mode</div>
          <small class="text-muted">Toggle dark theme</small>
        </div>
        <label class="theme-toggle mb-0">
          <input type="checkbox" id="darkModeToggle">
          <span class="theme-slider"></span>
        </label>
      </div>
      
      <a href="notifications-settings.php" class="d-flex align-items-center text-decoration-none text-dark settings-link">
        <i class="ri-notification-3-line fs-5 me-3 text-primary"></i>
        <div class="flex-grow-1">
          <div class="fw-semibold">Notifications</div>
          <small class="text-muted">Manage alerts</small>
        </div>
        <i class="ri-arrow-right-s-line fs-5 text-muted"></i>
      </a>

      <a href="#" class="d-flex align-items-center text-decoration-none text-dark settings-link">
        <i class="ri-global-line fs-5 me-3 text-primary"></i>
        <div class="flex-grow-1">
          <div class="fw-semibold">Language</div>
          <small class="text-muted">English (US)</small>
        </div>
        <i class="ri-arrow-right-s-line fs-5 text-muted"></i>
      </a>
    </div>

    <div class="section-divider"></div>

    <!-- Other Options -->
    <div class="mb-4">
      <h6 class="text-uppercase text-muted small fw-bold mb-3">
        <i class="ri-information-line me-1"></i> More
      </h6>
      
      <a href="help.php" class="d-flex align-items-center text-decoration-none text-dark settings-link">
        <i class="ri-questionnaire-line fs-5 me-3 text-primary"></i>
        <div class="flex-grow-1">
          <div class="fw-semibold">Help & Support</div>
          <small class="text-muted">Get assistance</small>
        </div>
        <i class="ri-arrow-right-s-line fs-5 text-muted"></i>
      </a>

      <a href="about.php" class="d-flex align-items-center text-decoration-none text-dark settings-link">
        <i class="ri-information-line fs-5 me-3 text-primary"></i>
        <div class="flex-grow-1">
          <div class="fw-semibold">About</div>
          <small class="text-muted">Version 1.0.0</small>
        </div>
        <i class="ri-arrow-right-s-line fs-5 text-muted"></i>
      </a>
    </div>

    <div class="section-divider"></div>

    <!-- Logout -->
    <div class="mt-4">
      <a href="logout.php" class="btn btn-danger w-100 py-3 fw-semibold">
        <i class="ri-logout-box-line me-2"></i> Logout
      </a>
    
    </div>

  </div>
</div>

<script>
// Handle active state
document.querySelectorAll('.navbar .nav-link').forEach(link => {
  link.addEventListener('click', function(e) {
    // Skip if it's the settings button
    if (this.tagName === 'BUTTON') return;
    
    document.querySelectorAll('.navbar .nav-link').forEach(l => {
      l.classList.remove('active');
      l.classList.add('text-muted');
    });
    this.classList.remove('text-muted');
    this.classList.add('active');
  });
});

// Dark mode toggle
document.getElementById('darkModeToggle')?.addEventListener('change', function() {
  if (this.checked) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
  }
});

// Load dark mode preference
if (localStorage.getItem('darkMode') === 'enabled') {
  document.getElementById('darkModeToggle').checked = true;
  document.body.classList.add('dark-mode');
}
</script>


<script>
document.addEventListener("DOMContentLoaded", () => {
  // get current pathname (without query string)
  const currentPath = window.location.pathname.replace(/\/+$/, ""); // remove trailing slash
  const currentFile = currentPath.split("/").pop() || "index.php"; // fallback

  // find all nav links inside the bottom navbar
  const navLinks = document.querySelectorAll(".navbar .nav-link");

  // helper to extract href file portion robustly
  function hrefFilePart(link) {
    try {
      // If href is absolute, URL() will work; for relative, new URL with base
      const url = new URL(link.getAttribute("href"), window.location.origin);
      let p = url.pathname.replace(/\/+$/, "");
      return p.split("/").pop() || "index.php";
    } catch (e) {
      return link.getAttribute("href")?.split("/").pop() || "";
    }
  }

  navLinks.forEach(link => {
    // skip links without href (e.g., offcanvas toggle button) or anchors like '#'
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    const filePart = hrefFilePart(link);

    if (filePart === currentFile) {
      // add active class to the link
      link.classList.add("active");

      // animate the <i> icon inside the link
      const icon = link.querySelector("i");
      if (icon) {
        // Remove any leftover class so animation can restart cleanly
        icon.classList.remove("animate-pop");
        // Force reflow so the animation class restart is honored
        void icon.offsetWidth;
        // Add animation class
        icon.classList.add("animate-pop");

        // Clean up after animation ends so it can rerun next time
        icon.addEventListener("animationend", function handler() {
          icon.classList.remove("animate-pop");
          icon.removeEventListener("animationend", handler);
        });
      }
    }
  });
});
</script>

<!-- Page JS -->
</body>

</html>