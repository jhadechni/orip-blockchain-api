import { BigNumber, Contract } from 'ethers';
import {
  ethers,
  deployments,
  getNamedAccounts,
  getUnnamedAccounts
} from 'hardhat';

/**
 * Connect a series of accounts to a series of contracts
 * @param addresses the addresses to connect
 * @param contracts the object with the contracts
 * @returns the users with their contract
 */
export async function setupUsers<
  T extends { [contractName: string]: Contract }
>(addresses: string[], contracts: T): Promise<({ address: string } & T)[]> {
  const users: ({ address: string } & T)[] = [];
  for (const address of addresses) {
    users.push(await setupUser(address, contracts));
  }
  return users;
}

/**
 * Connect an account to a series of contracts
 * @param address the address of the acount
 * @param contracts the object with the contracts
 */
export async function setupUser<T extends { [contractName: string]: Contract }>(
  address: string,
  contracts: T
): Promise<{ address: string } & T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = { address };
  for (const key of Object.keys(contracts)) {
    user[key] = contracts[key].connect(await ethers.getSigner(address)); //conects the account to the contract
  }
  return user as { address: string } & T;
}

export async function setup<T extends Contract>(name: string) {
  // it first ensures the deployment is executed and reset (use of evm_snapshot for faster tests)
  await deployments.fixture([name]); //This line allow to execute the corresponding deploy script prior to the test
  // we get an instantiated contract in the form of a ethers.js Contract instance:
  const contracts = {
    DeployedContract: (await ethers.getContract(name)) as T
  };

  // we get the tokenOwner
  const { admin } = await getNamedAccounts(); //This gives you access to the tokenOwner address, the same address that was used in the deploy script.
  const users = await setupUsers(await getUnnamedAccounts(), contracts);
  // finally we return the whole object (including the tokenOwner setup as a User object)
  return {
    ...contracts,
    users,
    deployer: await setupUser(admin, contracts)
  };
}