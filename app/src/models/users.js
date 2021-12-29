let userList = [
  {
    id: 1,
    room: "nodejs14",
    username: "Nguyễn Phong Hào",
  },
  {
    id: 2,
    room: "nodejs14",
    username: "Nguyễn Phong Dinh",
  },
];

// thêm mới
const addUser = (user) => (userList = [...userList, user]);
// xóa user
const removeUser = (id) =>
  (userList = userList.filter((user) => user.id !== id));
// lấy danh sách user theo phòng
const getListUserByRoom = (room) =>
  userList.filter((user) => user.room === room);
// get user by id
const getUserById = (id) => userList.find((user) => user.id === id);

module.exports = {
  addUser,
  removeUser,
  getListUserByRoom,
  getUserById,
};
