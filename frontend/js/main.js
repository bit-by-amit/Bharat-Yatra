// frontend/js/main.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const from = document.getElementById("from").value.trim();
      const to = document.getElementById("to").value.trim();
      const date = document.getElementById("date").value;

      // Store in localStorage for next page
      localStorage.setItem("search", JSON.stringify({ from, to, date }));

      // Redirect to results page
      window.location.href = "results.html";
    });
  }
});
