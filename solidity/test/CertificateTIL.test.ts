import { constants } from "ethers";
import { ethers } from "hardhat";
import { CertificadoTIL } from "../typechain-types";
import { expect } from "./chai-setup";
import { setup } from "./utils";

describe("CertificateTIL", () => {
  it("Only Owner Can Add Certificate", async () => {
    const { deployer, users, DeployedContract } = await setup<CertificadoTIL>(
      "CertificadoTIL"
    );
    expect(
      users[0].DeployedContract.addCertificado("0x0", "")
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
  it("Add Certificado Works", async () => {
    const { deployer, users, DeployedContract } = await setup<CertificadoTIL>(
      "CertificadoTIL"
    );
    const owner = users[0].address;
    await expect(deployer.DeployedContract.addCertificado(owner, ""))
      .to.emit(DeployedContract, "Transfer")
      .withArgs(constants.AddressZero, owner, 0);

    const savedOwner = await DeployedContract.ownerOf(0);

    expect(savedOwner).to.equals(owner);

    const certificatesOfOwner = await DeployedContract.balanceOf(owner);
    expect(certificatesOfOwner.eq(1)).to.be.true;
  });
});
