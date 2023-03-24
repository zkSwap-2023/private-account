import { ethers } from "hardhat";
import { ENTRYPOINT } from "../test/utils/constants";
import {
  PrivatePaymaster,
  PrivatePaymaster__factory,
} from "../typechain-types";
import { config as dConfig } from "dotenv";

dConfig();

async function main() {
  let Paymaster: PrivatePaymaster__factory;
  let paymaster: PrivatePaymaster;

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  Paymaster = await ethers.getContractFactory("PrivatePaymaster");
  paymaster = await Paymaster.deploy(
    process.env.FACTORY,
    process.env.SYMBOL,
    ENTRYPOINT
  );

  console.log("Paymaster deployed to:", paymaster.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
