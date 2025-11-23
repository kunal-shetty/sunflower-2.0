<?php include("../Reusables/head.php"); ?>
<?php include("../Reusables/headBody.php"); ?>

<main class="register-page d-flex flex-column justify-content-center align-items-center text-center vh-100 p-4">

  <div class="register-icon mb-3 d-flex justify-content-center align-items-center">
    <i class="bi bi-stars"></i>
  </div>

  <h2 class="fw-bold mb-2 text-light">Welcome Back! </h2>
  <p class="text-light-50 mb-4">Get it done beautifully</p>

  <!-- REMOVE action + method -->
  <form id="login-form" class="w-100 p-4 rounded-4 shadow-lg" style="max-width: 380px;">

    <div class="mb-3 text-start">
      <label for="email" class="form-label fw-semibold">Email</label>
      <input type="email" class="form-control form-control-lg rounded-3 shadow-sm" id="email"
        placeholder="Enter your email" required>
    </div>

    <div class="mb-3 text-start">
      <label for="password" class="form-label fw-semibold">Password</label>
      <input type="password" class="form-control form-control-lg rounded-3 shadow-sm" id="password"
        placeholder="Enter your password" required>
    </div>

    <button type="submit" class="btn btn-gradient btn-lg w-100 rounded-pill shadow-sm mb-3">
      <i class="bi bi-person-plus-fill me-2"></i> Login
    </button>

    <p class="text-dark mb-0">
      Don't have an account?
      <a href="register.php" class="text-decoration-none fw-semibold text-primary">Signup</a>
    </p>
  </form>

</main>

<script type="module" src="login.js"></script>
<?php include("../Reusables/foot.php"); ?>