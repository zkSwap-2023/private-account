import { ethers } from "hardhat";
import { ENTRYPOINT } from "../test/utils/constants";
import {
  PrivateAccountFactory,
  PrivateAccountFactory__factory,
} from "../typechain-types";

async function main() {
  let Factory: PrivateAccountFactory__factory;
  let factory: PrivateAccountFactory;

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  Factory = await ethers.getContractFactory("PrivateAccountFactory");
  factory = await Factory.deploy(ENTRYPOINT);

  console.log("Factory deployed to:", factory.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
