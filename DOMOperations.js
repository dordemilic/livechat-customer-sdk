import * as DOMElements from "./DOMElements";

const isAtTheBottom = (element, tolerance = 20) =>
  element.scrollTop + element.clientHeight >= element.scrollHeight - tolerance;

export const getMessageList = () => document.getElementById("chat-container__chat");

export const createMessage = (id, text, authorType, avatar, createdAt) => {
  const messageDivContainer = document.createElement("div");
  messageDivContainer.dataset.id = id;
  messageDivContainer.classList.add("message-container", authorType);
  if (avatar) {
    const avatarImage = document.createElement("img");
    avatarImage.src = avatar;
    avatarImage.classList.add("agent-avatar");
    messageDivContainer.append(avatarImage);
  }

  const timestampSpan = document.createElement("span");
  timestampSpan.classList.add("timestamp");
  timestampSpan.textContent = formatTimestamp(createdAt);
  messageDivContainer.append(timestampSpan);

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageDiv.innerHTML = "<div>" + text + "</div>";
  messageDivContainer.append(messageDiv);
  return messageDivContainer;
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours}:${minutes}`;
};

export const appendMessage = (message) => {
  const messageList = getMessageList();
  const shouldScrollToBottom = isAtTheBottom(messageList);
  messageList.appendChild(message);
  if (shouldScrollToBottom) {
    scrollToBottom();
  }
};

export const prependMessages = (chatId, messages) => {
  const messageList = getMessageList(chatId);
  messages.reverse().forEach((message) => {
    const firstMessage = messageList.children[0];
    if (firstMessage) {
      messageList.insertBefore(message, firstMessage);
      return;
    }
    appendMessage(chatId, message);
  });
};

export const markAsFailedMessage = (id) => {};

export const confirmMessageAsSent = (id) => {};

export const disableInput = (text) => {
  if (text) {
    DOMElements.input.placeholder = text;
  }
  DOMElements.input.disabled = true;
};

export const enableInput = () => {
  DOMElements.input.placeholder = "Write a message";
  DOMElements.input.disabled = false;
};

export const disableSendButton = () => {
  DOMElements.sendButton.disabled = true;
};

export const enableSendButton = () => {
  DOMElements.sendButton.disabled = false;
};

export const toggleMinimized = () => {
  DOMElements.lcWindow.classList.toggle("minimized");
  DOMElements.lcWindowMinimized.classList.toggle("minimized");
};

export const scrollToBottom = () => {
  const messageList = getMessageList();
  messageList.scrollTop = messageList.scrollHeight;
};

export const showChat = () => {
  DOMElements.startChatButton.style.display = "none";
  DOMElements.textareaWrapper.style.display = "flex";

  DOMElements.input.focus();
};

export const hideChat = () => {
  DOMElements.textareaWrapper.style.display = "none";
  showStartChatButton();
};

export const showFooter = () => {
  DOMElements.footer.style.display = "block";
};

export const showStartChatButton = () => {
  DOMElements.startChatButton.style.display = "inline-block";
};

const closest = (to, element) => {
  const toClass = to.substr(1);
  let target = element;
  while (target) {
    if (target.classList.contains(toClass)) {
      return target;
    }
    target = target.parentElement;
  }

  return null;
};

export const delegate = (from, to, eventName, handler) => {
  const targetSelector = `${to}, ${to} *`;

  document.querySelector(from).addEventListener(eventName, (ev) => {
    if (!ev.target.matches(targetSelector)) {
      return;
    }

    handler.call(closest(to, ev.target), ev);
  });
};

// TODO: dedupe it later its a copy from "@livechat/chat.io/utils"
// with exception that this one handles context passing
export const throttle = (ms, fn) => {
  let lastCall = Date.now() - 2 * ms;
  let result;
  let trailing;

  function invoke(...args) {
    lastCall = Date.now();
    return (result = fn.apply(this, args));
  }

  return function throttler(...args) {
    const now = Date.now();

    if (now - lastCall >= ms) {
      return invoke.apply(this, args);
    }

    clearTimeout(trailing);
    trailing = setTimeout(() => invoke.apply(this, args), lastCall - now + ms);

    return result;
  };
};
