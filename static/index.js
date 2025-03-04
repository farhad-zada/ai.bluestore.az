const inputContainer = document.getElementById("input-container");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const chatContainer = document.getElementById("chat-container");
const newSessionBtn = document.getElementById("new-session-btn");
const modal = document.getElementById("modal");
const confirmBtn = document.getElementById("confirm-btn");
const cancelBtn = document.getElementById("cancel-btn");
let sessionActive = false;

// Load chat history from localStorage on page load
window.addEventListener("load", () => {
  const savedChat = localStorage.getItem("chatHistory");
  if (savedChat) {
    chatContainer.innerHTML = savedChat;
    sessionActive = true;
    updateInputPosition();
  }
  scrollToBottom();
});

// Add event listeners
messageInput.addEventListener("focus", () => {
  inputContainer.classList.add("focused");
  inputContainer.classList.remove("centered");
});

messageInput.addEventListener("blur", () => {
  if (chatContainer.children.length > 0) {
    inputContainer.classList.add("has-messages");
  } else {
    inputContainer.classList.remove("focused");
    inputContainer.classList.add("centered");
  }
});

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    messageInput.blur();
  }
});

sendBtn.addEventListener("click", sendMessage);
newSessionBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

// Function to show loading animation
function showLoading() {
  const loadingDiv = document.createElement("div");
  loadingDiv.classList.add("message", "ai-message");
  loadingDiv.id = "loading-message";
  loadingDiv.textContent = "...";
  chatContainer.appendChild(loadingDiv);
  scrollToBottom();
  return loadingDiv;
}

// Function to remove loading animation
function removeLoading() {
  const loadingDiv = document.getElementById("loading-message");
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

// Function to save chat to localStorage
function saveChat() {
  localStorage.setItem("chatHistory", chatContainer.innerHTML);
}

// Function to scroll to bottom ensuring last message is fully visible
function scrollToBottom() {
  const lastMessage = chatContainer.lastElementChild;
  if (lastMessage) {
    lastMessage.scrollIntoView({ behavior: "smooth", block: "end" });
  } else {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

// Function to update input position based on chat content
function updateInputPosition() {
  if (chatContainer.children.length > 0) {
    inputContainer.classList.add("has-messages");
    inputContainer.classList.remove("centered");
  } else {
    inputContainer.classList.remove("has-messages");
    inputContainer.classList.add("centered");
  }
}

// Simple Markdown formatting function
function formatMessage(text) {
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic
    .replace(/\n/g, "<br>"); // Line breaks
  return formatted;
}

// Start new session and clear history
confirmBtn.addEventListener("click", async () => {
  let loadingElement = document.getElementById("loading-btn");
  let thisButton = document.getElementById("confirm-btn");
  loadingElement.style.display = "block";
  thisButton.style.display = "none";

  if (sessionActive) {
    await fetch("http://localhost:3000/session", {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });
  }

  try {
    const response = await fetch("http://localhost:3000/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ question: "What is your name?" }),
    });

    if (response.ok) {
      const data = await response.json();
      sessionActive = true;
      chatContainer.innerHTML = "";
      localStorage.removeItem("chatHistory");
      messageInput.value = "";
      inputContainer.classList.remove("focused");
      inputContainer.classList.add("centered");
      modal.style.display = "none";
      scrollToBottom();
    }
  } catch (error) {
    console.error("Error starting new session:", error);
  }

  thisButton.style.display = "block";
  loadingElement.style.display = "none";
});

cancelBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Send message and update session
async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  const userMessage = document.createElement("div");
  userMessage.classList.add("message", "user-message");
  userMessage.innerHTML = formatMessage(message);
  chatContainer.appendChild(userMessage);

  updateInputPosition();
  const loadingDiv = showLoading();
  try {
    let response = await fetch("http://localhost:3000/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ question: message }),
    });
    if (response.ok) {
      sessionActive = true;
    }

    if (response.ok) {
      const data = await response.json();
      removeLoading();
      const aiMessage = document.createElement("div");
      aiMessage.classList.add("message", "ai-message");
      aiMessage.innerHTML = formatMessage(data.response || "Response from AI");
      chatContainer.appendChild(aiMessage);
      saveChat();
      scrollToBottom();
    } else {
      throw new Error("API request failed");
    }
  } catch (error) {
    removeLoading();
    const errorMessage = document.createElement("div");
    errorMessage.classList.add("message", "ai-message");
    errorMessage.textContent = "Sorry, there was an error processing your request.";
    chatContainer.appendChild(errorMessage);
    saveChat();
    scrollToBottom();
    console.error("Error sending message:", error);
  }

  messageInput.value = "";
  updateInputPosition();
  saveChat();
}

function sendSuggestion(message) {
  messageInput.value = message;
  sendMessage();
}
