const crypto = require('crypto');
const fs = require('fs');
const { pipeline } = require('stream/promises');
const path = require('path');
const { generateDEK } = require('../vault/vaultEnvelope');
const EnvelopeEncryptionModel = require('../models/EnvelopeEncryption');

class VaultDataService {
    /**
     * @param {string} inputFilePath - Đường dẫn file gốc (do Multer upload lên thư mục tạm)
     * @param {string} originalFileName - Tên file gốc (VD: hop_dong.docx)
     */
    static async encryptWordAndSave(inputFilePath, originalFileName) {
        const storageDir = path.join(__dirname, '../../storage');
        if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

        // Tạo tên file mã hóa duy nhất (thêm timestamp để tránh trùng file nếu user upload 2 lần)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const encryptedFileName = `${originalFileName}_${uniqueSuffix}.enc`;
        const outputFilePath = path.join(storageDir, encryptedFileName);

        let dekBuffer = null;

        try {
            // 1. Gọi tầng Vault xin DEK
            const keys = await generateDEK('my-key');
            dekBuffer = Buffer.from(keys.plaintext, 'base64');
            const iv = crypto.randomBytes(12);

            // 2. Stream mã hóa File
            const cipherStream = crypto.createCipheriv('aes-256-gcm', dekBuffer, iv);
            await pipeline(
                fs.createReadStream(inputFilePath),
                cipherStream,
                fs.createWriteStream(outputFilePath)
            );

            const authTag = cipherStream.getAuthTag();

            // 3. Đóng gói Ciphertext (IV|AuthTag|Path)
            const packedCiphertext = `${iv.toString('hex')}|${authTag.toString('hex')}|${outputFilePath}`;

            // 4. Gọi tầng Model lưu Database
            // Lưu ý: Dùng đúng tên cột 'data_encryption_key' hoặc '"dataEncryptionKey"' mà bạn đã fix ở bước trước
            const dbRecord = await EnvelopeEncryptionModel.create({
                ciphertext: packedCiphertext,
                dataEncryptionKey: keys.ciphertext 
            });

            // 5. Trả về object chứa đường dẫn để Controller thực hiện lệnh Download
            return {
                dbRecord,
                downloadPath: outputFilePath,
                encryptedFileName
            };

        } catch (error) {
            throw new Error(`Lỗi Service: ${error.message}`);
        } finally {
            // RẤT QUAN TRỌNG VỀ BẢO MẬT VÀ TỐI ƯU Ổ CỨNG:
            
            // Dọn dẹp DEK khỏi RAM
            if (dekBuffer) dekBuffer.fill(0);

            // Xóa ngay file văn bản gốc (chưa mã hóa) mà user vừa upload lên server
            // Chỉ giữ lại bản .enc an toàn trong thư mục storage
            if (fs.existsSync(inputFilePath)) {
                fs.unlinkSync(inputFilePath);
            }
        }
    }

    /**
     * Giải mã file từ thông tin Database
     * @param {Object} dbRecord - Bản ghi lấy lên từ PostgreSQL
     */
    static async decryptWordAndRead(dbRecord) {
        // 1. TÁCH GÓI DỮ LIỆU (Unpacking)
        // Cắt chuỗi "IV|AuthTag|Path" từ cột ciphertext
        const [ivHex, authTagHex, encryptedFilePath] = dbRecord.ciphertext.split('|');
        const wrappedDek = dbRecord.dataEncryptionKey;

        // Kiểm tra xem file vật lý có còn tồn tại trên server không
        if (!fs.existsSync(encryptedFilePath)) {
            throw new Error("Không tìm thấy file mã hóa trên hệ thống lưu trữ.");
        }

        let dekBuffer = null;
        
        // Tạo đường dẫn cho file sau khi giải mã (VD: hop_dong_decrypted.docx)
        const decryptedFilePath = encryptedFilePath.replace('.enc', '_decrypted.docx');

        try {
            console.log("🔓 1. Đang nhờ Vault mở khóa DEK...");
            const plainDekBase64 = await decryptDEK('my-key', wrappedDek);
            
            // 2. Ép kiểu dữ liệu về Buffer chuẩn của Node.js
            dekBuffer = Buffer.from(plainDekBase64, 'base64');
            const iv = Buffer.from(ivHex, 'hex');
            const authTag = Buffer.from(authTagHex, 'hex');

            console.log("🔓 2. Đang tiến hành Stream giải mã file...");
            // 3. Khởi tạo thuật toán Giải mã
            const decipherStream = crypto.createDecipheriv('aes-256-gcm', dekBuffer, iv);
            
            // RẤT QUAN TRỌNG: Cài đặt chữ ký xác thực
            decipherStream.setAuthTag(authTag); 

            // 4. Bơm dữ liệu: Đọc file .enc -> Giải mã -> Ghi ra file .docx
            await pipeline(
                fs.createReadStream(encryptedFilePath),
                decipherStream,
                fs.createWriteStream(decryptedFilePath)
            );

            console.log("✅ Giải mã thành công! File đã sẵn sàng.");
            return decryptedFilePath;

        } catch (error) {
            // Lỗi kinh điển: Nếu hacker sửa 1 byte trong file .enc, hàm pipeline sẽ throw lỗi ở đây
            console.error("❌ Lỗi giải mã:", error.message);
            throw new Error("Giải mã thất bại. File có thể đã bị can thiệp hoặc sai chìa khóa.");
        } finally {
            // Dọn dẹp RAM
            if (dekBuffer) dekBuffer.fill(0);
        }
    }
}

module.exports = VaultDataService;