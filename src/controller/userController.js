const userService = require('../services/userService');

const UserController = {
    async getUser(req, res, next) {
        try {
            // Lấy email từ token/session (middleware trước đó đã gán vào req.user)
            const email = req.user.email.trim();

            // Truy vấn database qua Service
            const userInfo = await userService.getUserInfo(email);

            if (!userInfo) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Trả về dữ liệu
            // Dùng optional chaining (?.) và trim() để cắt khoảng trắng thừa do kiểu character(30) sinh ra
            res.json({
                email: userInfo.email?.trim(),
                address: userInfo.address?.trim() || null,
                phone: userInfo.phone?.trim() || null
            });

        } catch (error) {
            console.error('❌ Error in getUser Controller:', error.message);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

module.exports = UserController;