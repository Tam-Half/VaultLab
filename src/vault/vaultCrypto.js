const vaultClient = require("./vaultClient");
const { loginVault } = require("./vaultAuth");

async function encryptData(plaintext) {
  try {
    await loginVault();

    // Vault Transit yêu cầu dữ liệu đầu vào phải là Base64
    const base64 = Buffer.from(plaintext).toString("base64");
    const result = await vaultClient.write(
      "transit/encrypt/my-key",
      { plaintext: base64 }
    );

    return result.data.ciphertext; // Trả về chuỗi dạng vault:v1:...
  } catch (error) {
    console.error("❌ Encryption failed:", error.message);
    throw error;
  }
}

async function decryptData(ciphertext) {
    if (!ciphertext) return null;

    const cleanCiphertext = ciphertext.trim();

    // 2. Kiểm tra xem dữ liệu có bắt đầu bằng chữ "vault:v1:" không
    // Nếu không phải, khả năng đây là dữ liệu cũ chưa mã hóa -> Trả về nguyên bản
    if (!cleanCiphertext.startsWith("vault:v")) {
        console.warn("⚠️ Dữ liệu không chứa tiền tố của Vault, bỏ qua giải mã.");
        return cleanCiphertext; 
    }

    try {
        await loginVault();

        // Gửi chuỗi ĐÃ LÀM SẠCH lên Vault
        const result = await vaultClient.write(
            "transit/decrypt/my-key",
            { ciphertext: cleanCiphertext }
        );

        // Vault trả về base64, cần dịch ngược lại sang UTF-8
        const plaintext = Buffer.from(result.data.plaintext, "base64").toString("utf-8");

        return plaintext; 
    } catch (error) {
        console.error("❌ Decryption failed:", error.message);
        throw error;
    }
}

module.exports = { encryptData, decryptData }; // Export cả hai hàm