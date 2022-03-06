document.addEventListener("DOMContentLoaded", function(event) {
    const queryString = window.location.search;
    console.log(queryString);
    const urlParams = new URLSearchParams(queryString);
});


// Check url urlParams
// If exists retrieve else random
// put values in inputs