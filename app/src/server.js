const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
const dateFormat = require("date-format");
const Filter = require("bad-words");
const { addUser, getListUserByRoom, removeUser } = require("./models/users");

const app = express();

// Static file
const publicPathDirectory = path.join(__dirname, "../public");
app.use(express.static(publicPathDirectory));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
});

// Nhận sự kiện kết nối từ client
io.on("connection", (socket) => {
  /**
   * Xử lý Room
   */
  socket.on("join-room-client-to-server", function ({ room, username }) {
    socket.join(room);

    // Thêm user vào userlist
    const newUser = {
      room,
      username,
      id: socket.id,
    };
    addUser(newUser);

    /**
     * Xử lý danh sách người dùng theo phòng
     */
    io.emit("send-user-list-server-to-client", getListUserByRoom(room));

    /**
     * Xử lý câu chào
     * 1) Chào người dùng vừa join vào room.
     * 2) Thông báo cho các người dùng còn lại biết có người vừa join vào room.
     */
    socket.emit("send-messages-server-to-client", {
      username: "ADMIN",
      time: dateFormat("dd/MM/yyyy - hh:mm:ss", new Date()),
      content: `Chào mừng ${username} đến với ${room} !!`,
    });

    socket.broadcast.to(room).emit("send-messages-server-to-client", {
      username: "ADMIN",
      time: dateFormat("dd/MM/yyyy - hh:mm:ss", new Date()),
      content: `${username} vừa tham gia vào ${room} !!`,
    });

    /**
     * Xử lý Chat
     */
    // Nhận messages từ Client
    socket.on("send-messages-client-to-server", function (message, callback) {
      // Kiểm tra nội dung Chat
      const filter = new Filter();
      if (filter.isProfane(message)) {
        return callback("Nội dung không hợp lệ");
      }

      // Tạo tin nhắn trả về cho Client
      const newMessages = {
        username,
        time: dateFormat("dd/MM/yyyy - hh:mm:ss", new Date()),
        content: message,
      };
      // Lưu messages vào Database (MongoDB)

      // Gửi messages về các Client
      io.to(room).emit("send-messages-server-to-client", newMessages);

      // Gửi tin nhắn thành công
      callback();
    });

    // Xử lý chia sẻ vị trí
    socket.on("share-location-client-to-server", ({ latitude, longitude }) => {
      const urlLocation = `https://www.google.com/maps?${latitude},${longitude}`;
      // Tạo tin nhắn gửi vị trí
      const newMessagesLocation = {
        username,
        time: dateFormat("dd/MM/yyyy - hh:mm:ss", new Date()),
        urlLocation,
      };
      io.to(room).emit("share-location-server-to-client", newMessagesLocation);
    });
  });

  // Ngắt kết nối
  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log(`Client có id là ${socket.id} vừa ngắt kết nối`);
  });
});

const port = 3333;
httpServer.listen(port, () => {
  console.log("App run on Port" + port);
});
