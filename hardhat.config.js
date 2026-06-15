require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const isValidKey = PRIVATE_KEY && PRIVATE_KEY.length === 64;

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: isValidKey ? [PRIVATE_KEY] : [],
    },
  },
};
