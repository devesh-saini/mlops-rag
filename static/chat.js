document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById("submit-button");
    const chatForm = document.querySelector("main form");
    const chatBarText = document.querySelector(".chat-bar-text");

    // --- 1. Event Listeners for FORM submission (unchanged) ---
    submitButton.addEventListener("click", (event) => {
        handleChatSubmit(event);
    });

    chatForm.addEventListener("submit", (event) => {
        handleChatSubmit(event);
    });
    
    chatBarText.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            handleChatSubmit(event);
        }
    });

    // --- 2. NEW: Event Listeners for NAV BUTTONS ---

    // Define the prompts for each button
    const navButtonPrompts = {
        "me-button": "Introduce yourself.",
        "projects-button": "Show me your projects.",
        "skills-button": "What are your skills?",
        "contact-button": "How can I contact you?"
    };

    // Find all nav buttons and add listeners
    document.querySelectorAll(".nav-button").forEach(button => {
        button.addEventListener("click", (event) => {
            
            if (button.id === "resume-button") {
                return;
            }

            event.preventDefault(); // Stop the <a> tag from jumping to #
            
            // Get the prompt associated with this button's ID
            const userQuery = navButtonPrompts[button.id];
            
            if (userQuery) {
                // Send the programmatic message
                submitQuery(userQuery);
            }
        });
    });
});

let isFirstMessage = true; // To track if we need to run the 'expand' animation

// --- 3. REFACTORED: The old 'handleChatSubmit' is now 'submitQuery' ---
// This new "master" function can be called by *any* part of our code.
function submitQuery(userQuery) {
    if (!userQuery || userQuery.trim() === "") {
        return; // Don't send empty messages
    }

    // Run the 'expand' animation only on the first message
    if (isFirstMessage) {
        expandUI();
        isFirstMessage = false;
    }

    const chatArea = document.querySelector(".chat-area");

    // Display the user's query
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.textContent = userQuery;
    chatArea.appendChild(userMessageDiv);

    // Create a container for the AI's response
    const aiMessageDiv = document.createElement('div');
    aiMessageDiv.className = 'message ai-message';
    aiMessageDiv.textContent = '...'; // Placeholder
    chatArea.appendChild(aiMessageDiv);

    // Scroll to the bottom of the chat area
    chatArea.scrollTop = chatArea.scrollHeight;
    
    // Call fetchResult to get the AI response
    fetchResult(userQuery, aiMessageDiv);
}

// --- 4. UPDATED: The 'handleChatSubmit' function is now much simpler ---
// It just handles the *form event* and passes the work to 'submitQuery'
function handleChatSubmit(event) {
    // Stop the form from reloading the page
    event.preventDefault();

    const chatBarText = document.querySelector(".chat-bar-text");
    const userQuery = chatBarText.value.trim();

    // Call our new master function
    submitQuery(userQuery);

    // Clear the input bar
    chatBarText.value = "";
}


// --- 5. UNCHANGED: Your other functions ---

function expandUI() {
    // This is your animation code, unchanged
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
    chat_area.style.margin = "16px";
    chat_area.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.07)";
}

async function fetchResult(userQuery, aiMessageDiv) {
    // Clear the '...' placeholder
    aiMessageDiv.textContent = "";

    const chatArea = document.querySelector(".chat-area");
    let fullResponse = "";
    let isStreamDone = false; 

    function renderMarkdown() {
        if (fullResponse.length === 0) return; 

        const htmlResponse = marked.parse(fullResponse);
        const sanitizedHtml = DOMPurify.sanitize(htmlResponse);
        aiMessageDiv.innerHTML = sanitizedHtml;

        chatArea.scrollTop = chatArea.scrollHeight;
    }

    const renderInterval = setInterval(() => {
        renderMarkdown();
        if (isStreamDone) {
            clearInterval(renderInterval);
        }
    }, 100);

    try {
        const response = await fetch('/getResponse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userQuery: userQuery })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                isStreamDone = true;
                break;
            }
            const chunk = decoder.decode(value);
            fullResponse += chunk;
        }

        clearInterval(renderInterval);
        renderMarkdown(); // Final render

    } catch (error) {
        console.error('Error fetching response:', error);
        isStreamDone = true;
        clearInterval(renderInterval);
        aiMessageDiv.textContent = `Sorry, an error occurred: ${error.message}`;
    }
}
