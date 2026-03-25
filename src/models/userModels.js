const db = require("../config/database"); // Import DB connection của bạn

const UserModel = {
    // Hàm cũ của bạn (nếu vẫn cần)
    getUserByEmail: async (email) => {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    },

    // Hàm mới: JOIN 2 bảng để lấy cả email, address và phone
    getUserInfoByEmail: async (email) => {
        const query = `
            SELECT u.email, i.address, i.phone
            FROM users u
            LEFT JOIN info_user i ON u.id::text = i.user_id::text
            WHERE u.email = $1
        `;
        const result = await db.query(query, [email]);
        return result.rows[0]; // Trả về object chứa email, address, phone
    }
};

module.exports = UserModel;