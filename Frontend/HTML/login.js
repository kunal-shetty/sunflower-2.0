import { apiRequest } from "../Reusables/api-request.js"
import { API_URLS } from "../Reusables/apiUrls.js"

$(document).ready(() => {
  $("#login-form").on("submit", function (e) {
    e.preventDefault();

    const data = {
      email: $("#email").val().trim(),
      password: $("#password").val().trim()
    };

    apiRequest(
      API_URLS.LOGIN,   // <— using the new router-based API URL
      "POST",
      data,
      function (response) {
        if (response.status === "success") {
          window.location.href = "../HTML/home.php";
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


})

