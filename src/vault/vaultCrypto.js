const vaultClient = require("./vaultClient");
const { loginVault } = require("./vaultAuth");

async function encryptData(plaintext) {
  try {
    await loginVault();

    // Vault Transit yêu cầu dữ liệu đầu vào phải là Base64
    const base64 = Buffer.from(data).toString("base64");
    const result = await vault.write(
      "transit/encrypt/my-key",
      { plaintext: base64 }
    );

    return result.data.ciphertext; // Trả về chuỗi dạng vault:v1:...
  } catch (error) {
    console.error("❌ Encryption failed:", error.message);
    throw error;
  }
}

module.exports = { encryptData };