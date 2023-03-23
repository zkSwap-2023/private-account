import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as dConfig } from "dotenv";

dConfig();

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    mumbai: {
      url: process.env.MUMBAI_RPC,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    goerli: {
      url: process.env.GOERLI_RPC,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    op: {
      url: process.env.OP_RPC,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    gnosis: {
      url: process.env.GNOSIS_RPC,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    scroll: {
      url: process.env.SCROLL_RPC,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    polygonzkevm: {
      url: process.env.POLYGONZKEVM_RPC,
      accounts: [process.env.PRIVATE_KEY as string],
    },
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      optimisticGoerli: process.env.ETHERSCAN_API_KEY,
      gnosis: process.env.GNOSISSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
    },
  },
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};

export default config;
