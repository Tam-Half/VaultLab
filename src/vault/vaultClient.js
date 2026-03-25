const vault = require("node-vault");
const dotenv = require("dotenv");
dotenv.config();

// Khởi tạo 1 client duy nhất
const vaultClient = vault({
  endpoint: process.env.VAULT_ADDR,
});

module.exports = vaultClient;