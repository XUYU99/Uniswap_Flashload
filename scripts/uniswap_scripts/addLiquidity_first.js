const { ethers } = require("hardhat");

// 主部署函数。
async function main() {
  console.log("------------获取实例，查看数据----------------------");
  //从 ethers 提供的 signers 中获取签名者。
  const [owner, account2, account3] = await ethers.getSigners();
  const ownerAddress = await owner.getAddress();
  const account02 = await account2.getAddress();
  const account03 = await account3.getAddress();
  console.log(`owner 地址: ${ownerAddress}`);
  console.log(`account02 地址: ${account02}`);
  console.log(`account03 地址: ${account03}`);

  // 获取 uniswap  合约实例
  const uniswapAddress = "0xb8c424F066100c2CF2806C446Bb51Fd998E917E3";
  //   const uniswap = new ethers.Contract(uniswapAddress, uniswap.abi, owner);
  const uniswap = await ethers.getContractAt(
    "UniswapV2Factory",
    uniswapAddress
  );
  console.log(`uniswapAddress ${await uniswap.getAddress()}`);

  // 获取 kokoToken 合约实例
  const kokoTokenAddress = "0x4b89966D76477980dABF34eB1691721E9D6b9296";
  const kokoToken = await ethers.getContractAt("ERC20token", kokoTokenAddress);
  console.log(`kokoToken Address ${await kokoToken.getAddress()}`);

  // 获取 acToken 合约实例
  const acTokenAddress = "0x204b0F5a85CEB3B85DeB9Eb94A23962621a45e45";
  const acToken = await ethers.getContractAt("ERC20token", acTokenAddress);
  console.log(`acToken Address ${await acToken.getAddress()}`);

  // 获取 router 合约实例
  const routerAddress = "0xc2C9f9d71859dB40825a80f6203D6c0193E86d97";
  const router = await ethers.getContractAt("Router", routerAddress);
  console.log(`routerAddress ${await router.getAddress()}`);

  //从链上获取 pair 合约
  const pairAddress = await uniswap.getPair(kokoTokenAddress, acTokenAddress);
  console.log(`pair 部署在 ${pairAddress}`);
  const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

  console.log("------------授权给 router----------------------");
  // 授权给 router 合约
  const approveTx1 = await kokoToken
    .connect(account2)
    .approve(routerAddress, ethers.parseEther("100"));
  const approveTx2 = await acToken
    .connect(account2)
    .approve(routerAddress, ethers.parseEther("50"));
  await approveTx1.wait();
  await approveTx2.wait();
  console.log("授权 100 个kokoToken和 50 个acToken给router");

  const isAllowance = await kokoToken.allowance(account02, routerAddress);
  console.log(`account2 授权给router数量: ${isAllowance.toString()}`);

  console.log("------------account2 首次添加流动性----------------------");
  //查询 LP 流动币数量和 pair 交易对的储备量
  let lpTokenBalance = await pair.balanceOf(account02);
  let reserves = await pair.getReserves();
  console.log(`owner LP 代币数量: ${lpTokenBalance.toString()};`);
  console.log(
    `pair 储备量: ${reserves[0].toString()}, ${reserves[1].toString()}`
  );

  //设置添加流动性的代币数量，分别添加 50 个koko币和 100   个ac币
  const token0Amount = ethers.parseEther("100");
  const token1Amount = ethers.parseEther("50");
  console.log(`首次添加ing......  添加 100 个kokoToken 和 50 个acToken， `);
  console.log(`后`);
  //开始添加流动性
  const deadline = Math.floor(Date.now() / 1000) + 10 * 60; //当前时间+10分钟的时间戳
  const addLiquidityTx = await router
    .connect(account2)
    .addLiquidity(
      kokoTokenAddress,
      acTokenAddress,
      token0Amount,
      token1Amount,
      0,
      0,
      account02,
      deadline
    );
  await addLiquidityTx.wait();

  //查询 LP 流动币数量和 pair 交易对的储备量
  lpTokenBalance = await pair.balanceOf(account02);
  reserves = await pair.getReserves();
  console.log(`owner LP 代币数量: ${lpTokenBalance.toString()}`);
  console.log(
    `pair 储备量: ${reserves[0].toString()}, ${reserves[1].toString()}`
  );
  let totalSupply = await pair.totalSupply();
  console.log("首次增加流动性后 totalSupply: ", totalSupply);
}

// 执行主函数并处理可能的结果。
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
