import { config as dotEnvConfig } from "dotenv";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-etherscan";
import { HardhatUserConfig } from "hardhat/types";
dotEnvConfig();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.1",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  namedAccounts: {
    admin: 0,
  },
  paths: {
    root: "./solidity", //better organization
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    ganache: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: [process.env.ADMIN_KEY!],
    },
    testnet: {
      url:
        process.env.TESTNET_URL ||
        "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: [process.env.ADMIN_KEY!],
    },
  },
  etherscan: {
    apiKey: {
      bscTestnet: process.env.ETHERSCAN_API_KEY!,
    },
  },
  mocha: {
    slow: 1000,
    bail: true,
    allowUncaught: true,
    diff: true,
    reporter: "spec",
    require: ["ts-node/register", "hardhat/register"],
    ui: "bdd",
    timeout: 60000,
  },
};

export default config;
