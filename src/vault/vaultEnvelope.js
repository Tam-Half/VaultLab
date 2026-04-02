const vaultClient = require("./vaultClient");
const { loginVault } = require("./vaultAuth");

/**
 * Xin cấp Data Key (DEK) từ Vault để phục vụ Envelope Encryption
 * @param {string} kekName - Tên của Key Encryption Key trên Vault (VD: 'my-key')
 * @param {string} [contextBase64] - (Tùy chọn) Chuỗi Base64 dùng cho tính năng Key Derivation
 * @returns {Promise<{plaintext: string, ciphertext: string}>}
 */
async function generateDEK(kekName, contextBase64 = null) {
    // 1. Đảm bảo ứng dụng đã có Token hợp lệ để nói chuyện với Vault
    await loginVault();

    // 2. Thiết lập Payload
    // Mặc định để trống (Vault sẽ tự sinh DEK 256-bit ngẫu nhiên).
    // Nếu bạn quản lý dữ liệu đa khách hàng (Multi-tenant), truyền context vào đây.
    const payload = {};
    if (contextBase64) {
        payload.context = contextBase64;
    }

    try {
        // 3. Thực hiện gọi API qua thư viện vaultClient
        const result = await vaultClient.write(
            `transit/datakey/plaintext/${kekName}`,
            payload
        );

        // 4. Bóc tách và trả về đúng 2 thành phần cốt lõi
        return {
            plaintext: result.data.plaintext,   // Plaintext DEK (Base64) -> Dùng xong phải xóa khỏi RAM
            ciphertext: result.data.ciphertext  // Wrapped DEK (vault:v... ) -> Đem đi lưu Database
        };

    } catch (error) {
        console.error(`❌ Lỗi khi xin cấp DEK từ Vault cho KEK [${kekName}]:`, error.message);
        // Quăng lỗi lên tầng Service/Controller xử lý tiếp
        throw error;
    }
}

async function decryptDEK(kekName, wrappedDek, contextBase64 = null) {
    await loginVault();

    // Payload lúc này không rỗng, mà phải chứa chiếc chìa khóa đang bị khóa
    const payload = { ciphertext: wrappedDek };
    if (contextBase64) payload.context = contextBase64;

    try {
        const result = await vaultClient.write(
            `transit/decrypt/${kekName}`,
            payload
        );

        // Vault trả về chiếc DEK nguyên bản (chuỗi Base64)
        return result.data.plaintext;
    } catch (error) {
        console.error(`❌ Lỗi nhờ Vault mở khóa DEK:`, error.message);
        throw error;
    }
}
module.exports = { generateDEK, decryptDEK };