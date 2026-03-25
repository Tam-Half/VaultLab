const userModel = require('../models/userModels');

const UserService = {
    async getUserInfo(email) {
        // Gọi hàm đã JOIN 2 bảng
        return await userModel.getUserInfoByEmail(email);
    }
};

module.exports = UserService;