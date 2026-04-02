const db = require("../config/database");

class EnvelopeEncryptionModel {
    static async create(data) {
        // Cấu trúc data sẽ nhận vào: { ciphertext: '...', dataEncryptionKey: '...' }
        console.log("\n[DATABASE] Đang lưu vào bảng envelope_encryption...");

        const query = `
    INSERT INTO envelope_encryption (ciphertext, "dataEncryptionKey") 
    VALUES ($1, $2) 
    RETURNING *;
`;
        await db.query(query, [data.ciphertext, data.dataEncryptionKey]);

        console.table([data]);
        return { id: 1, ...data };
    }
}

module.exports = EnvelopeEncryptionModel;