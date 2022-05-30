import { constants } from "ethers";
import { CertificadoTIL } from "../typechain-types";
import { expect } from "./chai-setup";
import { setup } from "./utils";

describe("CertificateTIL", () => {
  describe("Services", () => {
    it("Only Owner Can Add Certificate", async () => {
      const { deployer, users, DeployedContract } = await setup<CertificadoTIL>(
        "CertificadoTIL"
      );
      expect(
        users[0].DeployedContract.addCertificado("0x0", "")
      ).to.be.revertedWith("You are not an admin");
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

      const newOwnerPreviousBalance = await DeployedContract.balanceOf(
        newOwner
      );
      expect(newOwnerPreviousBalance.eq(0)).to.be.true;

      // emit Approval(ERC721.ownerOf(tokenId), to, tokenId);
      //Transfer(from, to, tokenId);
      await expect(
        deployer.DeployedContract.compraVenta(owner, newOwner, 0, "")
      )
        .to.emit(DeployedContract, "CompraVenta")
        .withArgs(owner, newOwner, 0, "");

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
      await expect(deployer.DeployedContract.anotacion(0, "LINK2"))
        .to.emit(DeployedContract, "Anotacion")
        .withArgs(0, "LINK2");
      const newUri = await DeployedContract.tokenURI(0);
      expect(newUri).to.equals("LINK2");
    });
    it("Only Owner/Approved Can CompraVenta", async () => {
      const { deployer, users, DeployedContract } = await setup<CertificadoTIL>(
        "CertificadoTIL"
      );
      const owner = users[0].address;
      const newOwner = users[2].address;
      await deployer.DeployedContract.addCertificado(owner, "LINK");
      await expect(
        users[2].DeployedContract.compraVenta(
          users[0].address,
          newOwner,
          0,
          "NEWLINK"
        )
      ).to.be.revertedWith(
        "CertificadoTIL: Caller is not token owner nor approved nor an admin"
      );
    });
  });
  describe("Admins", () => {
    it("Add Admin Working", async () => {
      const { deployer, users, DeployedContract } = await setup<CertificadoTIL>(
        "CertificadoTIL"
      );
      const wasAdmin = await DeployedContract.isAdmin(users[1].address);
      expect(wasAdmin).to.be.false;
      await expect(deployer.DeployedContract.addAdmin(users[1].address))
        .to.emit(DeployedContract, "AdminAdded")
        .withArgs(deployer.address, users[1].address);
      const isAdmin = await DeployedContract.isAdmin(users[1].address);
      expect(isAdmin).to.be.true;
    });
    it("Remove Admin Working", async () => {
      const { deployer, users, DeployedContract } = await setup<CertificadoTIL>(
        "CertificadoTIL"
      );
      const wasAdmin = await DeployedContract.isAdmin(users[1].address);
      expect(wasAdmin).to.be.false;
      await deployer.DeployedContract.addAdmin(users[1].address);
      let isAdmin = await DeployedContract.isAdmin(users[1].address);
      expect(isAdmin).to.be.true;
      await expect(deployer.DeployedContract.removeAdmin(users[1].address))
        .to.emit(DeployedContract, "AdminRemoved")
        .withArgs(deployer.address, users[1].address);
      isAdmin = await DeployedContract.isAdmin(users[1].address);
      expect(isAdmin).to.be.false;
    });
    it("Owner Is Always Admin", async () => {
      const { deployer, users, DeployedContract } = await setup<CertificadoTIL>(
        "CertificadoTIL"
      );
      const wasAdmin = await DeployedContract.isAdmin(deployer.address);
      expect(wasAdmin).to.be.true;
      await expect(
        deployer.DeployedContract.removeAdmin(deployer.address)
      ).to.be.revertedWith("CertificadoTIL: Owner cannot be removed as admin");
      const isAdmin = await DeployedContract.isAdmin(deployer.address);
      expect(isAdmin).to.be.true;
    });
  });
});
