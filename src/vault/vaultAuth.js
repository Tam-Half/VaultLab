const vaultClient = require("./vaultClient");

async function loginVault() {
  if (vaultClient.token) {
    return vaultClient.token;
  }

  console.log("🔄 Authenticating with Vault AppRole...");

  try {
    const result = await vaultClient.approleLogin({
      role_id: process.env.VAULT_ROLE_ID,
      secret_id: process.env.VAULT_SECRET_ID,
    });

    vaultClient.token = result.auth.client_token;
    console.log("✅ Vault AppRole login success");
    
    return vaultClient.token;
  } catch (error) {
    console.error("❌ Vault Login Failed:", error.message);
    throw error;
  }
}

module.exports = { loginVault };