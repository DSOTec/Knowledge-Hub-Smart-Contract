import { expect } from "chai";
import { ethers } from "hardhat";
import { KnowledgeToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("KnowledgeToken", function () {
  let knowledgeToken: KnowledgeToken;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const KnowledgeTokenFactory = await ethers.getContractFactory("KnowledgeToken");
    knowledgeToken = await KnowledgeTokenFactory.deploy(owner.address);
    await knowledgeToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await knowledgeToken.name()).to.equal("KnowledgeToken");
      expect(await knowledgeToken.symbol()).to.equal("KNOW");
    });

    it("Should set the correct owner", async function () {
      expect(await knowledgeToken.owner()).to.equal(owner.address);
    });

    it("Should have 18 decimals", async function () {
      expect(await knowledgeToken.decimals()).to.equal(18);
    });

    it("Should start with zero total supply", async function () {
      expect(await knowledgeToken.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      await knowledgeToken.mint(addr1.address, mintAmount);
      
      expect(await knowledgeToken.balanceOf(addr1.address)).to.equal(mintAmount);
      expect(await knowledgeToken.totalSupply()).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      await expect(
        knowledgeToken.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.revertedWithCustomError(knowledgeToken, "OwnableUnauthorizedAccount");
    });

    it("Should emit Transfer event when minting", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      await expect(knowledgeToken.mint(addr1.address, mintAmount))
        .to.emit(knowledgeToken, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, mintAmount);
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      // Mint some tokens to addr1 for burning tests
      await knowledgeToken.mint(addr1.address, ethers.parseEther("1000"));
    });

    it("Should allow users to burn their own tokens", async function () {
      const burnAmount = ethers.parseEther("100");
      const initialBalance = await knowledgeToken.balanceOf(addr1.address);
      
      await knowledgeToken.connect(addr1).burn(burnAmount);
      
      expect(await knowledgeToken.balanceOf(addr1.address)).to.equal(initialBalance - burnAmount);
      expect(await knowledgeToken.totalSupply()).to.equal(initialBalance - burnAmount);
    });

    it("Should not allow burning more than balance", async function () {
      const burnAmount = ethers.parseEther("2000"); // More than minted
      
      await expect(
        knowledgeToken.connect(addr1).burn(burnAmount)
      ).to.be.revertedWithCustomError(knowledgeToken, "ERC20InsufficientBalance");
    });

    it("Should allow burning from another address with allowance", async function () {
      const burnAmount = ethers.parseEther("100");
      
      // addr1 approves addr2 to spend tokens
      await knowledgeToken.connect(addr1).approve(addr2.address, burnAmount);
      
      // addr2 burns tokens from addr1
      await knowledgeToken.connect(addr2).burnFrom(addr1.address, burnAmount);
      
      expect(await knowledgeToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("900"));
    });

    it("Should not allow burning from another address without allowance", async function () {
      const burnAmount = ethers.parseEther("100");
      
      await expect(
        knowledgeToken.connect(addr2).burnFrom(addr1.address, burnAmount)
      ).to.be.revertedWithCustomError(knowledgeToken, "ERC20InsufficientAllowance");
    });
  });

  describe("Standard ERC20 functionality", function () {
    beforeEach(async function () {
      await knowledgeToken.mint(addr1.address, ethers.parseEther("1000"));
    });

    it("Should allow transfers between accounts", async function () {
      const transferAmount = ethers.parseEther("100");
      
      await knowledgeToken.connect(addr1).transfer(addr2.address, transferAmount);
      
      expect(await knowledgeToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("900"));
      expect(await knowledgeToken.balanceOf(addr2.address)).to.equal(transferAmount);
    });

    it("Should allow approved transfers", async function () {
      const transferAmount = ethers.parseEther("100");
      
      await knowledgeToken.connect(addr1).approve(addr2.address, transferAmount);
      await knowledgeToken.connect(addr2).transferFrom(addr1.address, addr2.address, transferAmount);
      
      expect(await knowledgeToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("900"));
      expect(await knowledgeToken.balanceOf(addr2.address)).to.equal(transferAmount);
    });
  });
});
