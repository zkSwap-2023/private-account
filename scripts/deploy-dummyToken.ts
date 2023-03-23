import { ethers } from "hardhat";
import { DummyToken, DummyToken__factory } from "../typechain-types";

async function main() {
  let DummyToken: DummyToken__factory;
  let dummyToken: DummyToken;

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  DummyToken = await ethers.getContractFactory("DummyToken");
  dummyToken = await DummyToken.deploy();

  console.log("Dummy ERC20 Token deployed to:", dummyToken.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
