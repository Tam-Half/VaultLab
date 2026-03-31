const db = require("../config/database");

const TestDataModel = {
    insertData: async (payment_id, phone, address) => {
        const query = `
            INSERT INTO datatestvault (payment_id, phone, address)
            VALUES ($1, $2, $3)
            RETURNING *; -- Trả về dòng dữ liệu vừa được insert
        `;
        const result = await db.query(query, [payment_id, phone, address]);
        return result.rows[0];
    },
   getEncryptedDataById: async (id) => {
        const query = `
            SELECT id, payment_id, phone, address
            FROM datatestvault
            WHERE id = $1; -- Điều kiện lọc theo ID
        `;
        // Truyền id vào mảng tham số của pg
        const result = await db.query(query, [id]);
        
        // Chỉ trả về object đầu tiên (vì id là duy nhất) hoặc undefined nếu không tìm thấy
        return result.rows[0]; 
    },
};

module.exports = TestDataModel;