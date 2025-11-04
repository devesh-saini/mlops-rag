document.addEventListener("DOMContentLoaded", () => {
    let submit = document.getElementById("submit-button");
    submit.addEventListener("click", expand);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            expand();
        }
    })
})

function expand() {
    const header = document.querySelector("header");
    header.innerHTML = "";
    header.style.margin = "0";
    header.style.position = "absolute";

    const avatar = document.querySelector(".avatar");
    avatar.style.width = "120px";

    const chat_area = document.querySelector(".chat-area");
    chat_area.style.borderRadius = "24px";
    chat_area.style.minHeight = "56vh";
    chat_area.style.minWidth = "88vw";
    chat_area.style.maxWidth = "800px";
    chat_area.style.margin = "16px";
    chat_area.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.07)";

    const chat_bar_text = document.querySelector(".chat-bar-text");
    user_query = chat_bar_text.value;
    console.log(user_query);
    chat_bar_text.value = "";
}
