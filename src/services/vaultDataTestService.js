const vaultCrypto = require('../vault/vaultCrypto');
const testDataModel = require('../models/vaultDataTestModel');

const TestDataService = {
    async addSecureData(rawData) {
        const { payment_id, phone, address } = rawData;

        console.log("🔄 Encrypting data before saving...");

        // Mã hóa từng trường dữ liệu
        // Note: Dùng Promise.all để mã hóa song song giúp tăng tốc độ xử lý
        const [encPaymentId, encPhone, encAddress] = await Promise.all([
            vaultCrypto.encryptData(payment_id),
            vaultCrypto.encryptData(phone),
            vaultCrypto.encryptData(address)
        ]);

        // Lưu dữ liệu đã mã hóa vào Database
        const savedRecord = await testDataModel.insertData(encPaymentId.trim(), encPhone.trim(), encAddress.trim());

        return savedRecord;
    },
    async getSecureDataById(id) {
        console.log(`🔄 Fetching encrypted data for ID: ${id}...`);

        // 1. Lấy dữ liệu đã mã hóa từ Model
        const encryptedRecord = await testDataModel.getEncryptedDataById(id);

        if (!encryptedRecord) {
            return null; // Trả về null nếu không tìm thấy ID trong DB
        }

        const { payment_id, phone, address } = encryptedRecord;

        // 2. Giải mã dữ liệu (giải mã song song 3 trường)
        const [decPaymentId, decPhone, decAddress] = await Promise.all([
            vaultCrypto.decryptData(payment_id),
            vaultCrypto.decryptData(phone),
            vaultCrypto.decryptData(address)
        ]);

        // 3. Trả về kết quả đã giải mã
        return {
            id: encryptedRecord.id,
            payment_id: decPaymentId,
            phone: decPhone,
            address: decAddress,
        };
    }
};

module.exports = TestDataService;