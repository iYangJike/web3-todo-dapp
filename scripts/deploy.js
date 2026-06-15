const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("使用账户部署:", deployer.address);
  console.log("账户余额:", (await ethers.provider.getBalance(deployer.address)).toString());

  const Todo = await ethers.getContractFactory("Todo");
  const todo = await Todo.deploy();
  await todo.waitForDeployment();

  const address = await todo.getAddress();
  console.log("Todo 合约已部署到:", address);
  console.log("\n请将以下地址更新到 frontend/src/hooks/useContract.js 中：");
  console.log(`const CONTRACT_ADDRESS = "${address}";`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
