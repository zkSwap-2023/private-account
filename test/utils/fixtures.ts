import hre from "hardhat";
import { FixtureEntryPoint } from "../../typechain-types";

export const deployEntrypoint = async (): Promise<FixtureEntryPoint> => {
  let entryPoint: FixtureEntryPoint;
  const Entrypoint = await hre.ethers.getContractFactory("FixtureEntryPoint");
  entryPoint = await Entrypoint.deploy();
  return entryPoint;
};
