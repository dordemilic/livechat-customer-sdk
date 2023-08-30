import "./style.css";
import * as CustomerSDK from "@livechat/customer-sdk";

const chatContainer = document.getElementById("chat-container");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-btn");
const agentMessageInput = document.getElementById("agent-message-input");
const sendAgentMessageButton = document.getElementById("send-agent-message-btn");

sendButton.addEventListener("click", () => {
  const messageText = messageInput.value;
  if (messageText) {
    simulateSendingCustomerMessage(messageText);
    displayChatMessages(chatMessages);
    messageInput.value = ""; // Clear the input field
  }
});

sendAgentMessageButton.addEventListener("click", () => {
  const agentMessageText = agentMessageInput.value;
  if (agentMessageText) {
    simulateSendingAgentMessage(agentMessageText);
    displayChatMessages(chatMessages);
    agentMessageInput.value = ""; // Clear the input field
  }
});

function displayChatMessages(messages) {
  // Clear existing messages
  chatContainer.innerHTML = "";

  // Iterate through messages and display them
  messages.forEach((message) => {
    const messageElement = document.createElement("div");
    messageElement.className = "message";

    // Create elements for message author, text, and timestamp
    const authorElement = document.createElement("p");
    authorElement.className = "author";
    authorElement.textContent =
      message.author === mockCustomer.id ? mockCustomer.name : mockAgent.name;
    messageElement.appendChild(authorElement);

    const textElement = document.createElement("p");
    textElement.className = "text";
    textElement.textContent = message.text;
    messageElement.appendChild(textElement);

    const timestampElement = document.createElement("span");
    timestampElement.className = "timestamp";
    timestampElement.textContent = formatTimestamp(message.timestamp);
    messageElement.appendChild(timestampElement);

    chatContainer.appendChild(messageElement);
  });

  // Scroll to the bottom to show the latest messages
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Function to format timestamp
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours}:${minutes}`;
}

// Mock Data
const mockAgent = {
  id: "ed9d4095-45d6-428d-5093-f8ec7f1f81b9",
  type: "agent",
  name: "Jane Doe",
  jobTitle: "Agent",
  avatar: "https://cdn.livechat-files.com/api/file/avatar.png",
};

const mockCustomer = {
  id: "ed9d0195-45d6-428d-5093-f8ec7f1471b9",
  type: "customer",
  name: "Dorde Milic",
  avatar: "https://cdn.livechat-files.com/api/file/avatar.png",
  fields: {
    custom_property: "BasketValue=10usd",
  },
};

const mockChat = {
  id: "OU0V0P0OWT",
  users: [mockAgent, mockCustomer],
  lastSeenTimestamps: {
    [mockAgent.id]: 1503062591000,
    [mockCustomer.id]: 1503062591000,
  },
  threads: ["OU0V0U3IMN"],
};

const mockMessageEvent = {
  type: "message",
  text: "Hi from Agent!",
  author: mockAgent.id,
  id: "OU0V0U3IMN_1",
  timestamp: 1503062591000,
  thread: "OU0V0U3IMN",
  properties: {},
};

const LICENSE_ID = 15965568;
const CLIENT_ID = "811343011b59d46e08cb64ceef8a4d66";

const customerSDK = CustomerSDK.init({
  licenseId: LICENSE_ID,
  clientId: CLIENT_ID,
});

const chatMessages = [];

// Connected event
customerSDK.on("connected", (payload) => {
  console.log("Connected to LiveChat");

  simulateGettingChat();

  messageInput.style.display = "block";
  sendButton.style.display = "block";

  customerSDK.on("incoming_typing_indicator", (payload) => {
    const { typingIndicator } = payload;

    if (typingIndicator.isTyping && typingIndicator.authorId === mockAgent.id) {
      displayAgentTypingIndicator(true);
    } else {
      displayAgentTypingIndicator(false);
    }
  });

  agentMessageInput.addEventListener("input", () => {
    if (agentMessageInput.value) {
      simulateAgentTyping(true);
    } else {
      simulateAgentTyping(false);
    }
  });
});

function displayAgentTypingIndicator(isTyping) {
  const typingIndicatorElement = document.getElementById("typing-indicator");
  typingIndicatorElement.style.display = isTyping ? "block" : "none";
}

function simulateAgentTyping(isTyping) {
  const typingIndicatorPayload = {
    typingIndicator: {
      authorId: mockAgent.id,
      isTyping: isTyping,
    },
  };

  displayAgentTypingIndicator(isTyping);
}

function simulateGettingChat() {
  const initialAgentMessage = {
    type: "message",
    text: `Hello, ${mockCustomer.name}! How can I assist you today?`,
    author: mockAgent.id,
    id: `OU0V0U3IMN_${chatMessages.length + 1}`,
    timestamp: Date.now(),
    thread: "OU0V0U3IMN",
    properties: {},
  };

  chatMessages.push(initialAgentMessage);

  // Display chat messages
  displayChatMessages(chatMessages);
}

// Send message
function simulateSendingCustomerMessage(text) {
  const newMessage = {
    type: "message",
    text: text,
    author: mockCustomer.id,
    id: `OU0V0U3IMN_${chatMessages.length + 1}`,
    timestamp: Date.now(),
    thread: "OU0V0U3IMN",
    properties: {},
  };

  chatMessages.push(newMessage);

  console.log("Customer Message sent:", newMessage);
}

function simulateSendingAgentMessage(text) {
  const newMessage = {
    type: "message",
    text: text,
    author: mockAgent.id,
    id: `OU0V0U3IMN_${chatMessages.length + 1}`,
    timestamp: Date.now(),
    thread: "OU0V0U3IMN",
    properties: {},
  };

  chatMessages.push(newMessage);

  console.log("Agent Message sent:", newMessage);
}

customerSDK.auth.getToken().then((token) => {
  console.log(token);
});
