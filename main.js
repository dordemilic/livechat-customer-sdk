import "./style.css";
import * as CustomerSDK from "@livechat/customer-sdk";

const chatContainer = document.getElementById("chat-container");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-btn");

sendButton.addEventListener("click", () => {
  const messageText = messageInput.value;
  if (messageText) {
    sendCustomerMessage(messageText);
    messageInput.value = ""; 
  }
});

const LICENSE_ID = 15965568;
const CLIENT_ID = "811343011b59d46e08cb64ceef8a4d66";

const customerSDK = CustomerSDK.init({
  licenseId: LICENSE_ID,
  clientId: CLIENT_ID,
});

const chatMessages = [];

const initialState = {
  customer: {
    id: "",
    type: "",
  },
  agent: {
    id: "",
    type: "",
  },
};

function useState(initialValue) {
  let value = initialValue;

  function getValue() {
    return value;
  }

  function setValue(newValue) {
    value = newValue;
  }

  return [getValue, setValue];
}

const [getCustomerData, setCustomerData] = useState(initialState.customer);
const [getAgentData, setAgentData] = useState(initialState.agent);

function getAndDisplayChat(chatId) {
  customerSDK
    .getChat({
      chatId: chatId,
    })
    .then((chat) => {
      const { id, access, users, properties, thread } = chat;
      const messages = thread.events.filter((event) => event.authorId !== "system");

      displayChatMessages(messages);
    })
    .catch((error) => {
      console.log(error);
    });
}

// Connected event
customerSDK.on("connected", (payload) => {
  console.log("Connected to LiveChat");

  customerSDK
    .getCustomer()
    .then((customer) => {
      setCustomerData(customer);

      customerSDK
        .getPredictedAgent({ groupId: 0 })
        .then((agentData) => {
          setAgentData(agentData.agent);

          console.log("Customer:", getCustomerData());
          console.log("Agent:", getAgentData());

          getAndDisplayChat("S007C3QD7Y");

          customerSDK.on("incoming_event", (payload) => {
            const { event } = payload;
            console.log(event.text)

            if (event.threadId === "S007C3QD7Y" && event.type === "message") {
              displayChatMessages([event.text]);
            }
          });
        })
        .catch((error) => {
          console.log("Error fetching agent data:", error);
        });
    })
    .catch((error) => {
      console.log("Error fetching customer data:", error);
    });

  messageInput.style.display = "block";
  sendButton.style.display = "block";
});

customerSDK.on('incoming_typing_indicator', (payload) => {
  const typingIndicatorElement = document.getElementById('typing-indicator');
  if (payload.typingIndicator.isTyping) {
    const authorId = payload.typingIndicator.authorId;
    const authorName = authorId === getAgentData().id ? getAgentData().name : 'Agent';
    typingIndicatorElement.textContent = `${authorName} is typing...`;
    typingIndicatorElement.style.display = 'block';
  } else {
    typingIndicatorElement.style.display = 'none';
  }
});

function displayChatMessages(messages) {
  chatContainer.innerHTML = "";

  messages.forEach((message) => {
    const messageElement = document.createElement("div");
    messageElement.className = "message";

    const timestamp = new Date(message.createdAt);
    const formattedTimestamp = formatTimestamp(timestamp);

    if (message.authorId === getCustomerData().id) {
      messageElement.innerHTML = `
        <p class="sender sender-customer">Customer:</p>
        <p class="text">${message.text}</p>
        <p class="timestamp">${formattedTimestamp}</p>
      `;
    } else if (message.authorId === getAgentData().id) {
      messageElement.innerHTML = `
        <p class="sender sender-agent">${getAgentData().name}</p>
        <p class="text">${message.text}</p>
        <p class="timestamp">${formattedTimestamp}</p>
      `;
    } else {
      messageElement.innerHTML = `
        <p class="text">${message.text}</p>
        <p class="timestamp">${formattedTimestamp}</p>
      `;
    }

    chatContainer.appendChild(messageElement);
  });

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function formatTimestamp(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
}

function sendCustomerMessage(text) {
  const event = {
    type: "message",
    text: text,
    author: initialState.customer.id,
    id: `OU0V0U3IMN_${chatMessages.length + 1}`,
    timestamp: Date.now(),
    thread: "OU0V0U3IMN",
    properties: {},
  };

  customerSDK
    .sendEvent({
      chatId: "S007C3QD7Y",
      event: event,
    })
    .then(() => {
      console.log("Customer Message sent:", event);
    })
    .catch((error) => {
      console.log("Error sending customer message:", error);
    });
}

customerSDK.auth.getToken().then((token) => {
  console.log(token);
});
