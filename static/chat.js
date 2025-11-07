document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById("submit-button");
    const chatForm = document.querySelector("main form");
    const chatBarText = document.querySelector(".chat-bar-text");

    // Handle click on submit button
    submitButton.addEventListener("click", (event) => {
        handleChatSubmit(event);
    });

    // Handle 'Enter' key press in the input field
    chatForm.addEventListener("submit", (event) => {
        handleChatSubmit(event);
    });
    
    // Also capture 'Enter' keydown on the input to be safe
    chatBarText.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) { // Check for Enter, but not Shift+Enter
            handleChatSubmit(event);
        }
    });
});

let isFirstMessage = true; // To track if we need to run the 'expand' animation

function handleChatSubmit(event) {
    // --- FIX 1: Stop the form from reloading the page ---
    event.preventDefault();

    const chatBarText = document.querySelector(".chat-bar-text");
    const userQuery = chatBarText.value.trim();

    if (!userQuery) {
        return; // Don't send empty messages
    }

    // Run the 'expand' animation only on the first message
    if (isFirstMessage) {
        expandUI();
        isFirstMessage = false;
    }

    const chatArea = document.querySelector(".chat-area");

    // --- FIX 2: Display the user's query ---
    // We create a new div for each message
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
    
    // Clear the input bar
    chatBarText.value = "";
    
    // --- FIX 3: Call fetchResult and pass the AI's message element ---
    fetchResult(userQuery, aiMessageDiv);
}

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
    let fullResponse = "";  // This variable will buffer the raw text
    let isStreamDone = false; // Flag to tell our render loop when to stop

    // --- 1. The Render Function ---
    // This function will be called on a timer.
    // It reads the buffer and updates the HTML.
    function renderMarkdown() {
        if (fullResponse.length === 0) return; // Don't render an empty string

        // Convert the current buffer to HTML
        const htmlResponse = marked.parse(fullResponse);
        // Sanitize it
        const sanitizedHtml = DOMPurify.sanitize(htmlResponse);
        // Update the DOM
        aiMessageDiv.innerHTML = sanitizedHtml;

        // Auto-scroll to the bottom
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    // --- 2. The "Render Loop" ---
    // Start an interval that runs our render function
    // 10 times per second (every 100 milliseconds).
    const renderInterval = setInterval(() => {
        renderMarkdown();
        
        // If the stream is done, stop this loop
        if (isStreamDone) {
            clearInterval(renderInterval);
        }
    }, 100);

    // --- 3. The "Fetch Loop" (Your existing code) ---
    // This runs as fast as possible, just updating the buffer.
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
                isStreamDone = true; // Tell the render loop we're done
                break; // Exit the fetch loop
            }
            
            const chunk = decoder.decode(value);
            fullResponse += chunk; // Just add to the buffer
        }

        // --- 4. Final Cleanup ---
        // Just in case the loop stopped, we clear the interval
        // and run one final render to make sure we have
        // the *very last* chunk of text.
        clearInterval(renderInterval);
        renderMarkdown(); // Final render

    } catch (error) {
        console.error('Error fetching response:', error);
        
        // Stop the loop on error
        isStreamDone = true;
        clearInterval(renderInterval);
        
        aiMessageDiv.textContent = `Sorry, an error occurred: ${error.message}`;
    }
}

