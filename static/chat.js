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
    header.style.transition = "ease 0.5s";
    header.style.color = "white";
    header.style.transform = "translateY(-25vh)";

    const main = document.querySelector("main");
    main.style.transition = "ease 0.5s";
    main.style.transform = "translateY(-30vh)";

    const nav = document.querySelector("nav");
    nav.style.transform = "translateY(-30vh)";
    nav.style.transition = "ease 0.5s";

    const avatar = document.querySelector(".avatar");
    avatar.style.transform = "translateY(8vh)";
    avatar.style.transition = "ease-out 0.5s";
    avatar.style.width = "160px";

    let chat_area = document.querySelector(".chat-area");
    chat_area.style.transition = "ease 0.5s";
    chat_area.style.borderRadius = "24px";
    chat_area.style.minHeight = "56vh";
    chat_area.style.minWidth = "88vw";
    chat_area.style.margin = "16px";
    chat_area.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.07)";
    
    const chat_bar_text = document.querySelector(".chat-bar-text");
    user_query = chat_bar_text.value;
    console.log(user_query);
    chat_bar_text.value = "";
    
    chat_area.value = user_query
    fetchResult(userQuery);
}

async function fetchResult(userQuery) {
    try {
        let response = await fetch('/getResponse', {
            method: POST;
            headers: {
                Content-Type: 'application/json'
            },
            body: JSON.stringify({userQuery: userQuery});
        });
        const data = await response.json();
        document.querySelector(".chat-area").value = data.result;
    } catch (error) {
        console.error('Error: ', error);
    }
}
