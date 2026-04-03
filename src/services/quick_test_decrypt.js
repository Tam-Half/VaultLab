const crypto = require('crypto');
const fs = require('fs');
const { pipeline } = require('stream/promises');

// Nhúng hàm decryptDEK từ tầng hạ tầng Vault của bạn
const { decryptDEK } = require('../vault/vaultEnvelope'); 

async function runQuickTest() {
    console.log("==============================================");
    console.log("🚀 Bắt đầu test nhanh luồng Giải mã...");

    // ==========================================
    // 1. DÁN DỮ LIỆU TỪ DATABASE CỦA BẠN VÀO ĐÂY
    // ==========================================
    // Copy chính xác giá trị ở cột ciphertext (bao gồm IV|AuthTag|Đường_dẫn)
    const dbCiphertext = "cb35db21dfb2d10da728cb13|e538c58b158073a99360fbde9645740d|G:\\ThucTap\\BookingFootBall_BE\\storage\\PARTY.docx_1775098839883-627590727.enc"; 
    
    // Copy chính xác giá trị ở cột data_encryption_key
    const wrappedDek = "vault:v4:wpI4SM11z8+smWxgfYwX6aBzucOgCcw5WYGFSruALMMChWZ+meK0O5GEMQpMlnnpwu6WC3u3OMWEFgLO";
    
    // Tên file đầu ra sau khi giải mã thành công
    const outputDecryptedFile = "./KET_QUA_GIAI_MA.docx";

    let dekBuffer = null;

    try {
        // 2. TÁCH DỮ LIỆU
        const [ivHex, authTagHex, encryptedFilePath] = dbCiphertext.split('|');

        if (!fs.existsSync(encryptedFilePath)) {
            throw new Error(`❌ Không tìm thấy file .enc tại đường dẫn: ${encryptedFilePath}`);
        }

        console.log("🔓 Đang nhờ Vault mở khóa chiếc chìa khóa (Wrapped DEK)...");
        // Gọi lên Vault để lấy Plaintext DEK
        // Lưu ý: Đảm bảo tên KEK ở đây ('my-key') đúng với tên bạn đã dùng lúc mã hóa
        const plainDekBase64 = await decryptDEK('my-key', wrappedDek);

        // 3. ÉP KIỂU VỀ BUFFER Node.js
        dekBuffer = Buffer.from(plainDekBase64, 'base64');
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');

        console.log("🔓 Đang giải mã file vật lý...");
        
        // 4. KHỞI TẠO THUẬT TOÁN GIẢI MÃ
        const decipherStream = crypto.createDecipheriv('aes-256-gcm', dekBuffer, iv);
        
        // Bắt buộc phải đưa chữ ký xác thực vào trước khi giải mã
        decipherStream.setAuthTag(authTag);

        // 5. BƠM LUỒNG DỮ LIỆU
        await pipeline(
            fs.createReadStream(encryptedFilePath),
            decipherStream,
            fs.createWriteStream(outputDecryptedFile)
        );

        console.log(`\n🎉 THÀNH CÔNG RỰC RỠ!`);
        console.log(`📁 Hãy mở file [ ${outputDecryptedFile} ] ra xem nội dung có chuẩn không nhé!`);

    } catch (error) {
        console.error("\n❌ GIẢI MÃ THẤT BẠI:");
        console.error(error.message);
    } finally {
        // Luôn luôn dọn dẹp RAM
        if (dekBuffer) dekBuffer.fill(0);
    }
}

// Chạy hàm test
runQuickTest();
// test