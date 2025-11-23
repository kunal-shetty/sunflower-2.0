<?php include("../Reusables/head.php"); ?>
<?php include("../Reusables/headBody.php"); ?>

<!-- Register Page -->
<main class="register-page d-flex flex-column justify-content-center align-items-center text-center vh-100 p-4">

  <!-- Icon -->
  <div class="register-icon mb-3 d-flex justify-content-center align-items-center">
    <i class="bi bi-stars"></i>
  </div>

  <!-- Titles -->
  <h2 class="fw-bold mb-2 text-light">Create Your Account</h2>
  <p class="text-light-50 mb-4">Join and start organizing your day</p>

  <!-- Register Form -->
  <form id="register-form" class="w-100 p-4 rounded-4 shadow-lg" style="max-width: 380px;">

    <div class="mb-3 text-start">
      <label for="name" class="form-label fw-semibold">Full Name</label>
      <input type="text" class="form-control form-control-lg rounded-3 shadow-sm" id="name"
        placeholder="Enter your name" required>
    </div>

    <div class="mb-3 text-start">
      <label for="email" class="form-label fw-semibold">Email</label>
      <input type="email" class="form-control form-control-lg rounded-3 shadow-sm" id="email"
        placeholder="Enter your email" required>
    </div>

    <div class="mb-3 text-start">
      <label for="password" class="form-label fw-semibold">Password</label>
      <input type="password" class="form-control form-control-lg rounded-3 shadow-sm" id="password"
        placeholder="Create a password" required>
    </div>

    <div class="mb-4 text-start">
      <label for="confirmPassword" class="form-label fw-semibold">Confirm Password</label>
      <input type="password" class="form-control form-control-lg rounded-3 shadow-sm" id="confirmPassword"
        placeholder="Re-enter password" required>
    </div>

    <!-- Submit -->
    <button type="submit" class="btn btn-gradient btn-lg w-100 rounded-pill shadow-sm mb-3">
      <i class="bi bi-person-plus-fill me-2"></i> Sign Up
    </button>

    <!-- Login link -->
    <p class="text-dark mb-0">
      Already have an account?
      <a href="login.php" class="text-decoration-none fw-semibold text-primary">Login</a>
    </p>

  </form>

</main>

<script type="module" src="register.js"></script>

<?php include("../Reusables/foot.php"); ?>
