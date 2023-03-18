import { ethers } from "hardhat";

async function main() {
  const ENTRYPOINT = '0x0576a174D229E3cFA37253523E645A78A0C91B57';

  const Factory = await ethers.getContractFactory("PrivateAccountFactory");
  const factory = await Factory.deploy(ENTRYPOINT);

  console.log('Factory deployed to:', factory.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
