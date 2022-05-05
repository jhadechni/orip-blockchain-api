import { config as dotEnvConfig } from "dotenv";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import "@typechain/hardhat";
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
    deployer: 0,
  },
  paths: {
    root: "./solidity", //better organization
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
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
