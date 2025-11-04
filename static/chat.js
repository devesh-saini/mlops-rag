document.addEventListener("DOMContentLoaded", () => {
    let submit = document.getElementById("submit-button");
    submit.addEventListener("click", expand);
})

function expand() {
    const header = document.querySelector("header");
    header.innerHTML = "";
    header.style.margin = "0";
}
