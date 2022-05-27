import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(
    "Account balance:",
    ethers.utils.formatEther(await deployer.getBalance())
  );
  // We get the contract to deploy
  const ContractFactory = await ethers.getContractFactory("PQRSD");
  const contract = await ContractFactory.deploy();

  console.log("Certificado TIL deployed to:", contract.address);
  console.log(`Gas price: ${contract.deployTransaction.gasPrice}`);
  console.log(`Gas used: ${contract.deployTransaction.gasLimit}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
