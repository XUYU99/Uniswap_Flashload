// Importing required modules and libraries from the ethers.js library.
const { Contract, ContractFactory } = require("ethers");

// Importing the contract JSON artifacts.
const WETH9 = require("../WETH9.json");
// const factoryArtifact = require("../artifacts/contracts/uniswap-v2-core/UniswapV2Factory.sol/UniswapV2Factory.json");
// const routerArtifact = require("../artifacts/contracts/uniswap-v2-periphery/UniswapV2Router02.sol/UniswapV2Router02.json");
// const pairArtifact = require("../artifacts/contracts/uniswap-v2-core/UniswapV2Pair.sol/UniswapV2Pair.json");
const { ethers } = require("hardhat");
const factoryArtifact = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const pairArtifact = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");
// 主部署函数。
async function main() {
  // 1. 从 ethers 提供的 signers 中获取签名者。
  const [owner] = await ethers.getSigners();
  console.log(`使用账户部署合约: ${owner.address}`);

  // 2. 初始化一个新的 Uniswap V2 Factory 合约工厂。
  // 这个工厂需要 factoryArtifact 中的 ABI 和字节码。
  const Factory = new ContractFactory(
    factoryArtifact.abi,
    factoryArtifact.bytecode,
    owner
  );

  // 3. 使用初始化的工厂部署一个新的 Factory 合约。
  // 部署是由 owner 签名的。
  const factory = await Factory.deploy(owner.address);

  // 4. 部署后，获取新部署的 Factory 合约的地址。
  const factoryAddress = await factory.getAddress();
  console.log(`Factory 部署在 ${factoryAddress}`);

  // 5. 初始化一个专门用于 Tether (USDT) 代币的合约工厂。
  const USDT = await ethers.getContractFactory("Tether", owner);

  // 6. 使用上述初始化的工厂部署 USDT 合约。
  const usdt = await USDT.deploy();

  // 7. 获取已部署的 USDT 合约的地址。
  const usdtAddress = await usdt.getAddress();
  console.log(`USDT 部署在 ${usdtAddress}`);

  // 8. 同样地，初始化一个用于 UsdCoin (USDC) 代币的合约工厂。
  const USDC = await ethers.getContractFactory("UsdCoin", owner);

  // 9. 部署 USDC 合约。
  const usdc = await USDC.deploy();

  // 10. 获取已部署的 USDC 合约的地址。
  const usdcAddress = await usdc.getAddress();
  console.log(`USDC 部署在 ${usdcAddress}`);

  /**
   * 现在我们已经部署了 Factory 合约和两个 ERC20 代币，
   * 我们可以部署 Router 合约。
   * Router 合约需要 Factory 合约和 WETH9 合约的地址。
   * WETH9 合约是 ETH 代币的包装器。
   * 但在此之前，我们需要先为 owner 铸造一些 USDT 和 USDC 代币。让我们先完成这一步。
   */

  // 11. 为 owner 铸造 1000 USDT 代币。
  await usdt.connect(owner).mint(owner.address, ethers.parseEther("1000"));

  // 12. 为 owner 铸造 1000 USDC 代币。
  await usdc.connect(owner).mint(owner.address, ethers.parseEther("1000"));

  // 13. 使用 Factory 合约，使用 USDT 和 USDC 的地址创建一个交易对。
  const tx1 = await factory.createPair(usdtAddress, usdcAddress);

  // 14. 等待交易在区块链上被确认。
  await tx1.wait();

  // 15. 从 Factory 合约中获取已创建的交易对的地址。
  const pairAddress = await factory.getPair(usdtAddress, usdcAddress);
  console.log(`交易对部署在 ${pairAddress}`);

  // 16. 使用交易对的地址和 ABI 初始化一个新的交易对合约实例。
  const pair = new Contract(pairAddress, pairArtifact.abi, owner);

  // 17. 查询交易对的储备量以检查流动性。
  let reserves = await pair.getReserves();
  console.log(`储备量: ${reserves[0].toString()}, ${reserves[1].toString()}`);

  // 18. 为 WETH9 合约初始化一个新的合约工厂。
  const WETH = new ContractFactory(WETH9.abi, WETH9.bytecode, owner);
  const weth = await WETH.deploy();
  const wethAddress = await weth.getAddress();
  console.log(`WETH 部署在 ${wethAddress}`);

  // 19. 为 Router 合约初始化一个新的合约工厂。
  const Router = new ContractFactory(
    routerArtifact.abi,
    routerArtifact.bytecode,
    owner
  );

  // 20. 使用上述初始化的工厂部署 Router 合约。
  const router = await Router.deploy(factoryAddress, wethAddress);
  const routerAddress = await router.getAddress();
  console.log(`Router 部署在 ${routerAddress}`);

  const MaxUint256 =
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

  const approveTx1 = await usdt.approve(routerAddress, MaxUint256);
  await approveTx1.wait();
  const approvalTx2 = await usdc.approve(routerAddress, MaxUint256);
  await approvalTx2.wait();

  const token0Amount = ethers.parseUnits("100");
  const token1Amount = ethers.parseUnits("100");

  const lpTokenBalanceBefore = await pair.balanceOf(owner.address);
  console.log(
    `在添加流动性之前，owner 持有的 LP 代币数量: ${lpTokenBalanceBefore.toString()}`
  );

  const deadline = Math.floor(Date.now() / 1000) + 10 * 60;
  const addLiquidityTx = await router
    .connect(owner)
    .addLiquidity(
      usdtAddress,
      usdcAddress,
      token0Amount,
      token1Amount,
      0,
      0,
      owner,
      deadline
    );
  await addLiquidityTx.wait();

  // 检查 owner 的 LP 代币余额
  const lpTokenBalance = await pair.balanceOf(owner.address);
  console.log(`owner 持有的 LP 代币数量: ${lpTokenBalance.toString()}`);

  reserves = await pair.getReserves();
  console.log(`储备量: ${reserves[0].toString()}, ${reserves[1].toString()}`);

  console.log("USDT_ADDRESS", usdtAddress);
  console.log("USDC_ADDRESS", usdcAddress);
  console.log("WETH_ADDRESS", wethAddress);
  console.log("FACTORY_ADDRESS", factoryAddress);
  console.log("ROUTER_ADDRESS", routerAddress);
  console.log("PAIR_ADDRESS", pairAddress);
}

// 此命令用于使用 hardhat 运行脚本。
// npx hardhat run --network localhost scripts/01_deployContracts.js

// 执行主函数并处理可能的结果。
main()
  .then(() => process.exit(0)) // 如果部署成功，退出进程。
  .catch((error) => {
    console.error(error); // 记录部署过程中遇到的任何错误。
    process.exit(1); // 以错误代码退出进程。
  });
