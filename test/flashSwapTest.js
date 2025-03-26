const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

const ERC20ABI = require("@uniswap/v2-core/build/ERC20.json").abi;

describe("Flash Swap Test", function () {
  const usdcAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const borrowAmount = 1000000000; // 1000
  let flashSwapAddress;
  let TestFlashSwapContract;
  before(async () => {
    const TestFlashSwapFactory = await ethers.getContractFactory("flashSwap");
    TestFlashSwapContract = await TestFlashSwapFactory.deploy(
      "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );
    flashSwapAddress = TestFlashSwapContract.getAddress();
  });

  it("Flash swap", async () => {
    // impersonate acc
    const deployer = await ethers.getSigners();
    // const impersonateSigner = await ethers.getSigner(USDCHolder);

    // Token Borrowed
    const usdc = ethers.getContractAt("ERC20token", usdcAddress);
    // const USDCHolderBalance = await USDCContract.balanceOf(impersonateSigner.address)
    // console.log(`USDC Holder Balance: ${USDCHolderBalance}`)
    const fee = Math.round((borrowAmount * 3) / 997) + 1;
    await usdc.connect(deployer).transfer(flashSwapAddress, fee);
    await TestFlashSwapContract.testFlashSwap(usdcAddress, borrowAmount);
    const TestFlashSwapContractBalance = await usdc.balanceOf(flashSwapAddress);
    expect(TestFlashSwapContractBalance.eq(BigNumber.from("0"))).to.be.true;
  });
});
