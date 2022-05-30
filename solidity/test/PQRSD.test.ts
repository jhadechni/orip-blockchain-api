import { constants, ethers } from "ethers";
import { PQRSD } from "../typechain-types";
import { expect } from "./chai-setup";
import { setup } from "./utils";

describe("PQRSD", () => {
  it("Create", async () => {
    const { deployer, users, DeployedContract } = await setup<PQRSD>("PQRSD");
    await expect(deployer.DeployedContract.create(users[2].address))
      .to.emit(DeployedContract, "StatusChanged")
      .withArgs(
        users[2].address,
        0,
        ethers.utils.formatBytes32String("CREATED")
      );
  });
  it("Update", async () => {
    const { deployer, users, DeployedContract } = await setup<PQRSD>("PQRSD");
    await deployer.DeployedContract.create(users[2].address);
    await expect(deployer.DeployedContract.update(0, "NEWSTATE"))
      .to.emit(DeployedContract, "StatusChanged")
      .withArgs(
        users[2].address,
        0,
        ethers.utils.formatBytes32String("NEWSTATE")
      );
  });
  it("Close", async () => {
    const { deployer, users, DeployedContract } = await setup<PQRSD>("PQRSD");
    await deployer.DeployedContract.create(users[2].address);
    await expect(deployer.DeployedContract.close(0))
      .to.emit(DeployedContract, "StatusChanged")
      .withArgs(
        users[2].address,
        0,
        ethers.utils.formatBytes32String("CLOSED")
      );
  });
  it("Only Emitter can close/update", async () => {
    const { deployer, users, DeployedContract } = await setup<PQRSD>("PQRSD");
    const tx = await deployer.DeployedContract.create(users[2].address);
    await tx.wait();
    await expect(
      users[3].DeployedContract.update(0, "TEST")
    ).to.be.revertedWith("PQRSD: You are not the emitter of this");
    await expect(users[3].DeployedContract.close(0)).to.be.revertedWith(
      "PQRSD: You are not the emitter of this"
    );
  });
});
