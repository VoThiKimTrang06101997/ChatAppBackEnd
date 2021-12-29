// Gửi một yêu cầu kết nối tới Server
const socket = io();

// Xử lý tính năng gửi tin nhắn thành công
const acknowledgements = (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Đã gửi tin nhắn thành công");
  }
};

// Xử lý chat
document.getElementById("form-messages").addEventListener("submit", (e) => {
  e.preventDefault();
  const message = document.getElementById("input-messages").value;
  // Gửi tin nhắn lên Server
  socket.emit("send-messages-client-to-server", message, acknowledgements);
});

// Nhận tin nhắn từ Server
socket.on(
  "send-messages-server-to-client",
  function ({ username, time, content }) {
    document.getElementById("messages-list").innerHTML += `
    <div class="message-item">
          <div class="message__row1">
            <p class="message__name">${username}</p>
            <p class="message__date">${time}</p>
          </div>
          <div class="message__row2">
            <p class="message__content">
              ${content}
            </p>
          </div>
        </div>
    `;
  }
);

// Xử lý Query String: ?room=FIFA04&username=messi
/**
 * {
 *  room: "FIFA04",
 *  username: "messi"
 * }
 */

const { room, username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// Gửi event lên Server để join vào phòng chat
socket.emit("join-room-client-to-server", { room, username });

// Xử lý danh sách User
socket.on("send-user-list-server-to-client", function (userList) {
  document.getElementById("user-list").innerHTML = userList
    .map(
      (user) => `
    <li class="app__item-user">${user.username}</li>
    `
    )
    .reduce((stringHtml, stringLi) => (stringHtml += stringLi), "");
});

// Xử lý vị trí
document.getElementById("btn-share-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Trình duyệt không cung cấp Location");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    socket.emit("share-location-client-to-server", location);
  });
});

socket.on(
  "share-location-server-to-client",
  ({ username, time, urlLocation }) => {
    document.getElementById("messages-list").innerHTML += `
    <div class="message-item">
          <div class="message__row1">
            <p class="message__name">${username}</p>
            <p class="message__date">${time}</p>
          </div>
          <div class="message__row2">
            <a href="${urlLocation}" target="_blank">Vị trí của ${username}</a>
          </div>
        </div>
    `;
  }
);
