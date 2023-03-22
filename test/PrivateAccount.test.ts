import hre, { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { UserOperationStruct } from "@account-abstraction/contracts";
import {
  PrivateAccount,
  FixtureEntryPoint,
  PrivateAccount__factory,
  DummyToken,
  DummyToken__factory,
} from "../typechain-types";
import { printOp } from "../src";
import { deployEntrypoint } from "./utils/fixtures";
import { ZERO_ETH, ONE_ETH, TWO_ETH, FIVE_ETH } from "./utils/constants";
import {
  fillUserOpDefaults,
  getUserOpHash,
  packUserOp,
  signUserOp,
} from "./utils/UserOp";

describe("PrivateAccount", () => {
  let privateAccount: PrivateAccount;
  let PrivateAccount: PrivateAccount__factory;
  let owner: SignerWithAddress;
  let unDoxxedAccount: SignerWithAddress;
  let doxxedAccountA: SignerWithAddress;
  let doxxedAccountB: SignerWithAddress;
  let entryPoint: FixtureEntryPoint;
  let DummyToken: DummyToken__factory;
  let dummyToken: DummyToken;
  let userOp: UserOperationStruct;

  before(async () => {
    // Deploy Entrypoint contract
    entryPoint = await deployEntrypoint();

    // Create Dummy ERC20 token Factory
    DummyToken = await ethers.getContractFactory("DummyToken");

    // Create PrivateAccount Factory
    PrivateAccount = await hre.ethers.getContractFactory("PrivateAccount");

    // UserOp arguments
    const callGasLimit = 200000;
    const verificationGasLimit = 100000;
    const maxFeePerGas = 3e9;
    const chainId = await ethers.provider
      .getNetwork()
      .then((net) => net.chainId);
  });

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    owner = signers[0];
    unDoxxedAccount = signers[1];
    doxxedAccountA = signers[2];
    doxxedAccountB = signers[3];

    // Deploy a PrivateAccount
    privateAccount = await PrivateAccount.deploy(entryPoint.address);

    // Deploy a dummy ERC20 token
    dummyToken = await DummyToken.deploy("StableCoin", "SC");

    // Fund privateAccount
    await dummyToken.mint(privateAccount.address);
    await owner.sendTransaction({
      value: ethers.utils.parseEther("1"),
      to: privateAccount.address,
    });

    await privateAccount.initialize(owner.address);

    // Add a doxxed account
    const addressHashA = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(["address"], [doxxedAccountA.address])
    );
    await privateAccount.addDoxxedAddressHash(addressHashA);

    // Create UserOp
  });

  it("should initialize the PrivateAccount with correct owner and EntryPoint", async () => {
    expect(await privateAccount.initialized()).to.equal(true);
    expect(await privateAccount.owner()).to.equal(owner.address);
    expect(await privateAccount.entryPoint()).to.equal(entryPoint.address);
  });

  it("should only allow initialization once", async () => {
    await expect(privateAccount.initialize(owner.address)).to.be.revertedWith(
      "Contract has been initialized already"
    );
  });

  it("should add and remove doxxed address hash correctly", async () => {
    const addressHashB = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(["address"], [doxxedAccountB.address])
    );
    await privateAccount.addDoxxedAddressHash(addressHashB);

    expect(await privateAccount.isDoxxedAddressHash(addressHashB)).to.be.true;

    await privateAccount.removeDoxxedAddressHash(addressHashB);
    expect(await privateAccount.isDoxxedAddressHash(addressHashB)).to.be.false;
  });

  it("owner should be able to call transfer to an undoxxed account", async () => {
    await privateAccount.execute([unDoxxedAccount.address], [ONE_ETH], ["0x"]);
  });

  it("non-owner should not be be able to call transfer to an undoxxed account", async () => {
    await expect(
      privateAccount
        .connect(ethers.provider.getSigner(1))
        .execute([unDoxxedAccount.address], [ONE_ETH], ["0x"])
    ).to.be.revertedWith("account: not Owner or EntryPoint");
  });

  it("should not be able to call transfer to a doxxed account", async () => {
    await expect(
      privateAccount.execute([doxxedAccountA.address], [ONE_ETH], ["0x"])
    ).to.be.revertedWith("Doxxed: Destination Account is Doxxed");
  });

  it("should execute multiple ERC20 transactions successfully", async () => {
    // Target contract address
    const dest = [dummyToken.address, dummyToken.address];
    // ERC20 recipient
    const to = [owner.address, unDoxxedAccount.address];
    // 0 Values
    const value = [ZERO_ETH, ZERO_ETH];
    // ERC20 amount
    const amount = [ONE_ETH, FIVE_ETH];
    // Get initial balances using map() and Promise.all()
    const initialBalances = await Promise.all(
      to.map(async (address) => {
        return await dummyToken.balanceOf(address);
      })
    );

    // Encode transfer transaction
    const func = [
      dummyToken.interface.encodeFunctionData("transfer", [to[0], amount[0]]),
      dummyToken.interface.encodeFunctionData("transfer", [to[1], amount[1]]),
    ];

    await privateAccount.execute(dest, value, func);

    const finalBalances = await Promise.all(
      to.map(async (address) => {
        return await dummyToken.balanceOf(address);
      })
    );

    // Compare initial and final balances
    for (let i = 0; i < dest.length; i++) {
      const diff = finalBalances[i].sub(initialBalances[i]);
      expect(diff).to.equal(amount[i]);
    }
  });
});
