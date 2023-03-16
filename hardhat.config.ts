import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as dConfig } from 'dotenv';

dConfig();

const config: HardhatUserConfig = {
	defaultNetwork: 'hardhat',
	networks: {
      hardhat: {},
      mumbai: {
        url: process.env.MUMBAI_RPC,
        accounts: [process.env.PRIVATE_KEY as string]
      },
      sepolia: {
        url: process.env.SEPOLIA_RPC,
        accounts: [process.env.PRIVATE_KEY as string]
      },
  },
	solidity: {
		version: '0.8.19',
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
};

export default config;
