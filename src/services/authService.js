const tokenUtils = require('../utils/tokenUtils')
const bcrypt = require('bcryptjs');
const users = require('../data/data.js')
const jwt = require('jsonwebtoken')
const UserModel = require('../models/userModels')

const AuthService = {

    generateAccessToken: async (user) => {
        const accesstoken = tokenUtils.generateToken(
            { user },
            process.env.TOKEN_LIFE
        )

        return accesstoken
    },

    generateRefreshToken: async (user) => {

        const refreshToken = tokenUtils.generateRefreshToken(
            { user }
        )

        return refreshToken
    },

    login: async (email, password) => {
        // 1. Tìm user theo email (nhớ trim email đầu vào cho an toàn)
        const user = await UserModel.getUserByEmail(email.trim());
        console.log(`Fetched user:`, user);

        if (!user) {
            throw new Error('User not found'); // Tùy cách Controller bắt lỗi để trả về 404
        }

        // 2. Kiểm tra mật khẩu
        // Dùng === (strict equality) thay vì ==
        // Trim cả 2 bên vì cột password trong DB của bạn là character(8) sẽ có khoảng trắng thừa
        const isMatch = password.trim() === user.password.trim();

        if (!isMatch) {
            throw new Error('Invalid password'); // Controller nên bắt lỗi này trả về 401
        }

        // 3. Tạo Token
        const accessToken = await AuthService.generateAccessToken(user);
        const refreshToken = await AuthService.generateRefreshToken(user);

        // 4. Trả về kết quả
        return {
            user: {
                id: user.id,                   // Nên trả về thêm ID để Frontend tiện sử dụng
                email: user.email.trim(),      // Đổi 'name' thành 'email' cho đúng với dữ liệu thật
                accessToken: accessToken,
                refreshToken: refreshToken
            }
        };
    },


    refreshToken: async (refreshToken) => {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const payload = { id: decoded.id, email: decoded.email }
        const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '7d'
        });

        console.log(`USER `, { User: payload });

        return newAccessToken;

    }

}
module.exports = AuthService; 