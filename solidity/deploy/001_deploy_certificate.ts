import { HardhatRuntimeEnvironment } from "hardhat/types"; // This adds the type from hardhat runtime environment.
import { DeployFunction } from "hardhat-deploy/types"; // This adds the type that a deploy function is expected to fulfill.
import { ethers } from "hardhat";
// the deploy function receives the hardhat runtime env as an argument
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    getNamedAccounts, // we get the deployments and getNamedAccounts which are provided by hardhat-deploy.
    deployments: { deploy }, // The deployments field itself contains the deploy function.
  } = hre;
  const { admin } = await getNamedAccounts(); // Fetch the accounts. These can be configured in hardhat.config.ts as explained above.
  // This will create a deployment called 'BotContract'. By default it will look for an artifact with the same name. The 'contract' option allows you to use a different artifact.
  await deploy("CertificadoTIL", {
    from: admin, // Deployer will be performing the deployment transaction.
    args: [], /// args
    log: true, // Display the address and gas used in the console (not when run in test though).
  });
};

export default func;
func.tags = ["CertificadoTIL"]; // This sets up a tag so you can execute the script on its own (and its dependencies).
