import { constants } from "ethers";
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
    await expect(deployer.DeployedContract.addCertificado(owner, "LINK"))
      .to.emit(DeployedContract, "Transfer")
      .withArgs(constants.AddressZero, owner, 0);

    const savedOwner = await DeployedContract.ownerOf(0);

    expect(savedOwner).to.equals(owner);

    const certificatesOfOwner = await DeployedContract.balanceOf(owner);
    expect(certificatesOfOwner.eq(1)).to.be.true;
    const uri = await DeployedContract.tokenURI(0);
    expect(uri).to.equals("LINK");
  });
  it("Trasfer Works", async () => {
    const { deployer, users, DeployedContract } = await setup<CertificadoTIL>(
      "CertificadoTIL"
    );
    const owner = users[0].address;
    const newOwner = users[1].address;
    await deployer.DeployedContract.addCertificado(owner, "LINK");

    const previousOwnerBalance = await DeployedContract.balanceOf(owner);
    expect(previousOwnerBalance.eq(1)).to.be.true;

    const newOwnerPreviousBalance = await DeployedContract.balanceOf(newOwner);
    expect(newOwnerPreviousBalance.eq(0)).to.be.true;

    // emit Approval(ERC721.ownerOf(tokenId), to, tokenId);
    //Transfer(from, to, tokenId);
    await expect(users[0].DeployedContract.transferFrom(owner, newOwner, 0))
      .to.emit(DeployedContract, "Transfer")
      .withArgs(owner, newOwner, 0);

    const previousOwnerAfterBalance = await DeployedContract.balanceOf(owner);
    expect(previousOwnerAfterBalance.eq(0)).to.be.true;
    const newOwnerAfterBalance = await DeployedContract.balanceOf(newOwner);
    expect(newOwnerAfterBalance.eq(1)).to.be.true;

    const currentOwner = await DeployedContract.ownerOf(0);
    expect(currentOwner).to.equal(newOwner);
  });
  it("Update Works", async () => {
    const { deployer, users, DeployedContract } = await setup<CertificadoTIL>(
      "CertificadoTIL"
    );
    const owner = users[0].address;
    await deployer.DeployedContract.addCertificado(owner, "LINK");
    const uri = await DeployedContract.tokenURI(0);
    expect(uri).to.equals("LINK");
    await expect(deployer.DeployedContract.updateCertificado(0, "LINK2"))
      .to.emit(DeployedContract, "TokenUpdated")
      .withArgs(0, "LINK2");
    const newUri = await DeployedContract.tokenURI(0);
    expect(newUri).to.equals("LINK2");
  });
});
