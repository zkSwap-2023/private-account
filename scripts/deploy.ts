import { ethers } from "hardhat";
import { ENTRYPOINT } from "../test/utils/constants";

async function main() {

  const Factory = await ethers.getContractFactory("PrivateAccountFactory");
  const factory = await Factory.deploy(ENTRYPOINT);

  console.log("Factory deployed to:", factory.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
