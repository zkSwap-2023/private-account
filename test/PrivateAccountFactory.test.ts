import hre, { ethers } from "hardhat";
import { expect } from "chai";
import { PrivateAccountFactory, FixtureEntryPoint } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployEntrypoint } from "./utils/fixtures";

describe("Entrypoint", () => {
  it("should deploy entrypoint", async () => {
    const Entrypoint = await hre.ethers.getContractFactory("FixtureEntryPoint");
    await expect(Entrypoint.deploy()).not.reverted;
  });
});

describe("PrivateAccountFactory", () => {
  let privateAccountFactory: PrivateAccountFactory;
  let entryPoint: FixtureEntryPoint;
  let owner: SignerWithAddress;

  before(async () => {
    // Deploy Entrypoint contract
    entryPoint = await deployEntrypoint();
    // Deploy PrivateAccountFactory contract
    const PrivateAccountFactory = await hre.ethers.getContractFactory(
      "PrivateAccountFactory"
    );
    privateAccountFactory = await PrivateAccountFactory.deploy(
      entryPoint.address
    );
  });

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    owner = await signers[0];
  });

  it("should create a new account", async () => {
    const salt = 1;
    await privateAccountFactory.createAccount(owner.address, salt);
    const privateAccountAddress = await privateAccountFactory.getAddress(
      owner.address,
      salt
    );
    expect(privateAccountAddress).to.not.equal(ethers.constants.AddressZero);
  });

  it("should return the same address for the same salt and owner", async () => {
    const salt = 2;
    await privateAccountFactory.createAccount(owner.address, salt);
    const addressA = await privateAccountFactory.getAddress(
      owner.address,
      salt
    );
    await privateAccountFactory.createAccount(owner.address, salt);
    const addressB = await privateAccountFactory.getAddress(
      owner.address,
      salt
    );
    expect(addressA).to.equal(addressB);
  });

  it("should return the different address for the different salts", async () => {
    const saltA = 2;
    const saltB = 3;
    await privateAccountFactory.createAccount(owner.address, saltA);
    const addressA = await privateAccountFactory.getAddress(
      owner.address,
      saltA
    );
    await privateAccountFactory.createAccount(owner.address, saltB);
    const addressB = await privateAccountFactory.getAddress(
      owner.address,
      saltB
    );
    expect(addressA).to.not.equal(addressB);
  });
});
