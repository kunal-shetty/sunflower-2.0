import { apiRequest } from "../Reusables/api-request.js";
import { API_URLS } from "../Reusables/apiUrls.js";

$(document).ready(() => {

  $("#register-form").on("submit", function (e) {
    e.preventDefault();

    const data = {
      name: $("#name").val().trim(),
      email: $("#email").val().trim(),
      password: $("#password").val().trim(),
      confirmPassword: $("#confirmPassword").val().trim()
    };

    apiRequest(
      API_URLS.REGISTER,
      "POST",
      data,
      function (response) {
        if (response.status === "success") {
          window.location.href = "login.php";  // redirect to login
        } else {
          alert(response.message);
        }
      },
      function (err) {
        alert("Something went wrong.");
        console.error(err);
      }
    );
  });

});
