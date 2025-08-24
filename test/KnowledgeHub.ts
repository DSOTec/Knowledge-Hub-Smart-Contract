import { expect } from "chai";
import { ethers } from "hardhat";
import { KnowledgeToken, KnowledgeHub } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("KnowledgeHub", function () {
  let knowledgeToken: KnowledgeToken;
  let knowledgeHub: KnowledgeHub;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;
  let addr3: HardhatEthersSigner;

  // Sample IPFS CID for testing
  const sampleIPFSHash = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
  const sampleTitle = "Introduction to Blockchain Technology";

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    
    // Deploy KnowledgeToken
    const KnowledgeTokenFactory = await ethers.getContractFactory("KnowledgeToken");
    knowledgeToken = await KnowledgeTokenFactory.deploy(owner.address);
    await knowledgeToken.waitForDeployment();
    
    // Deploy KnowledgeHub
    const KnowledgeHubFactory = await ethers.getContractFactory("KnowledgeHub");
    knowledgeHub = await KnowledgeHubFactory.deploy(await knowledgeToken.getAddress());
    await knowledgeHub.waitForDeployment();
    
    // Mint tokens to the hub contract for rewards
    const rewardPool = ethers.parseEther("10000"); // 10,000 KNOW tokens
    await knowledgeToken.mint(await knowledgeHub.getAddress(), rewardPool);
  });

  describe("Deployment", function () {
    it("Should set the correct token address", async function () {
      expect(await knowledgeHub.knowledgeToken()).to.equal(await knowledgeToken.getAddress());
    });

    it("Should have correct upvote reward amount", async function () {
      expect(await knowledgeHub.UPVOTE_REWARD()).to.equal(ethers.parseEther("10"));
    });

    it("Should start with zero entries", async function () {
      expect(await knowledgeHub.getEntryCount()).to.equal(0);
    });
  });

  describe("Entry Submission", function () {
    it("Should allow users to submit knowledge entries", async function () {
      const tx = await knowledgeHub.connect(addr1).submitEntry(sampleTitle, sampleIPFSHash);
      
      await expect(tx)
        .to.emit(knowledgeHub, "EntrySubmitted")
        .withArgs(1, addr1.address, sampleTitle, sampleIPFSHash);
      
      const entry = await knowledgeHub.getEntry(1);
      expect(entry.id).to.equal(1);
      expect(entry.creator).to.equal(addr1.address);
      expect(entry.title).to.equal(sampleTitle);
      expect(entry.ipfsHash).to.equal(sampleIPFSHash);
      expect(entry.voteCount).to.equal(0);
      expect(entry.upvotes).to.equal(0);
      expect(entry.downvotes).to.equal(0);
    });

    it("Should increment entry count after submission", async function () {
      await knowledgeHub.connect(addr1).submitEntry(sampleTitle, sampleIPFSHash);
      expect(await knowledgeHub.getEntryCount()).to.equal(1);
      
      await knowledgeHub.connect(addr2).submitEntry("Another Title", sampleIPFSHash);
      expect(await knowledgeHub.getEntryCount()).to.equal(2);
    });

    it("Should not allow empty title", async function () {
      await expect(
        knowledgeHub.connect(addr1).submitEntry("", sampleIPFSHash)
      ).to.be.revertedWith("Title cannot be empty");
    });

    it("Should not allow empty IPFS hash", async function () {
      await expect(
        knowledgeHub.connect(addr1).submitEntry(sampleTitle, "")
      ).to.be.revertedWith("IPFS hash cannot be empty");
    });

    it("Should assign sequential IDs to entries", async function () {
      await knowledgeHub.connect(addr1).submitEntry("Title 1", sampleIPFSHash);
      await knowledgeHub.connect(addr2).submitEntry("Title 2", sampleIPFSHash);
      await knowledgeHub.connect(addr3).submitEntry("Title 3", sampleIPFSHash);
      
      const entry1 = await knowledgeHub.getEntry(1);
      const entry2 = await knowledgeHub.getEntry(2);
      const entry3 = await knowledgeHub.getEntry(3);
      
      expect(entry1.id).to.equal(1);
      expect(entry2.id).to.equal(2);
      expect(entry3.id).to.equal(3);
    });
  });

  describe("Voting Logic", function () {
    beforeEach(async function () {
      // Submit a test entry
      await knowledgeHub.connect(addr1).submitEntry(sampleTitle, sampleIPFSHash);
    });

    it("Should allow users to upvote entries", async function () {
      const tx = await knowledgeHub.connect(addr2).voteOnEntry(1, true);
      
      await expect(tx)
        .to.emit(knowledgeHub, "EntryVoted")
        .withArgs(1, addr2.address, true);
      
      const entry = await knowledgeHub.getEntry(1);
      expect(entry.voteCount).to.equal(1);
      expect(entry.upvotes).to.equal(1);
      expect(entry.downvotes).to.equal(0);
    });

    it("Should allow users to downvote entries", async function () {
      const tx = await knowledgeHub.connect(addr2).voteOnEntry(1, false);
      
      await expect(tx)
        .to.emit(knowledgeHub, "EntryVoted")
        .withArgs(1, addr2.address, false);
      
      const entry = await knowledgeHub.getEntry(1);
      expect(entry.voteCount).to.equal(-1);
      expect(entry.upvotes).to.equal(0);
      expect(entry.downvotes).to.equal(1);
    });

    it("Should prevent double voting on the same entry", async function () {
      await knowledgeHub.connect(addr2).voteOnEntry(1, true);
      
      await expect(
        knowledgeHub.connect(addr2).voteOnEntry(1, false)
      ).to.be.revertedWith("You have already voted on this entry");
    });

    it("Should prevent creators from voting on their own entries", async function () {
      await expect(
        knowledgeHub.connect(addr1).voteOnEntry(1, true)
      ).to.be.revertedWith("Cannot vote on your own entry");
    });

    it("Should not allow voting on non-existent entries", async function () {
      await expect(
        knowledgeHub.connect(addr2).voteOnEntry(999, true)
      ).to.be.revertedWith("Entry does not exist");
    });

    it("Should track vote status correctly", async function () {
      await knowledgeHub.connect(addr2).voteOnEntry(1, true);
      
      const [hasVoted, isUpvote] = await knowledgeHub.getVoteStatus(1, addr2.address);
      expect(hasVoted).to.be.true;
      expect(isUpvote).to.be.true;
      
      const [hasVoted2, isUpvote2] = await knowledgeHub.getVoteStatus(1, addr3.address);
      expect(hasVoted2).to.be.false;
      expect(isUpvote2).to.be.false; // Default value
    });
  });

  describe("Token Rewards", function () {
    beforeEach(async function () {
      await knowledgeHub.connect(addr1).submitEntry(sampleTitle, sampleIPFSHash);
    });

    it("Should distribute KNOW tokens when entry is upvoted", async function () {
      const initialBalance = await knowledgeToken.balanceOf(addr1.address);
      const rewardAmount = ethers.parseEther("10");
      
      const tx = await knowledgeHub.connect(addr2).voteOnEntry(1, true);
      
      await expect(tx)
        .to.emit(knowledgeHub, "RewardDistributed")
        .withArgs(1, addr1.address, rewardAmount);
      
      const finalBalance = await knowledgeToken.balanceOf(addr1.address);
      expect(finalBalance).to.equal(initialBalance + rewardAmount);
    });

    it("Should not distribute tokens for downvotes", async function () {
      const initialBalance = await knowledgeToken.balanceOf(addr1.address);
      
      await knowledgeHub.connect(addr2).voteOnEntry(1, false);
      
      const finalBalance = await knowledgeToken.balanceOf(addr1.address);
      expect(finalBalance).to.equal(initialBalance);
    });

    it("Should handle multiple upvotes correctly", async function () {
      const initialBalance = await knowledgeToken.balanceOf(addr1.address);
      const rewardAmount = ethers.parseEther("10");
      
      await knowledgeHub.connect(addr2).voteOnEntry(1, true);
      await knowledgeHub.connect(addr3).voteOnEntry(1, true);
      
      const finalBalance = await knowledgeToken.balanceOf(addr1.address);
      expect(finalBalance).to.equal(initialBalance + (rewardAmount * 2n));
      
      const entry = await knowledgeHub.getEntry(1);
      expect(entry.voteCount).to.equal(2);
      expect(entry.upvotes).to.equal(2);
    });
  });

  describe("Entry Retrieval", function () {
    beforeEach(async function () {
      await knowledgeHub.connect(addr1).submitEntry("Title 1", sampleIPFSHash);
      await knowledgeHub.connect(addr2).submitEntry("Title 2", "QmAnotherHash123");
      await knowledgeHub.connect(addr1).submitEntry("Title 3", "QmThirdHash456");
    });

    it("Should return all entry IDs", async function () {
      const entryIds = await knowledgeHub.getAllEntryIds();
      expect(entryIds.length).to.equal(3);
      expect(entryIds[0]).to.equal(1);
      expect(entryIds[1]).to.equal(2);
      expect(entryIds[2]).to.equal(3);
    });

    it("Should return entries by creator", async function () {
      const addr1Entries = await knowledgeHub.getEntriesByCreator(addr1.address);
      const addr2Entries = await knowledgeHub.getEntriesByCreator(addr2.address);
      
      expect(addr1Entries.length).to.equal(2);
      expect(addr1Entries[0]).to.equal(1);
      expect(addr1Entries[1]).to.equal(3);
      
      expect(addr2Entries.length).to.equal(1);
      expect(addr2Entries[0]).to.equal(2);
    });

    it("Should return empty array for creator with no entries", async function () {
      const addr3Entries = await knowledgeHub.getEntriesByCreator(addr3.address);
      expect(addr3Entries.length).to.equal(0);
    });

    it("Should return correct contract token balance", async function () {
      const balance = await knowledgeHub.getContractTokenBalance();
      expect(balance).to.equal(ethers.parseEther("10000"));
    });
  });

  describe("Complex Voting Scenarios", function () {
    beforeEach(async function () {
      await knowledgeHub.connect(addr1).submitEntry(sampleTitle, sampleIPFSHash);
    });

    it("Should handle mixed upvotes and downvotes correctly", async function () {
      await knowledgeHub.connect(addr2).voteOnEntry(1, true);  // +1
      await knowledgeHub.connect(addr3).voteOnEntry(1, false); // -1
      
      const entry = await knowledgeHub.getEntry(1);
      expect(entry.voteCount).to.equal(0);
      expect(entry.upvotes).to.equal(1);
      expect(entry.downvotes).to.equal(1);
      
      // Only one reward should be distributed (for the upvote)
      const creatorBalance = await knowledgeToken.balanceOf(addr1.address);
      expect(creatorBalance).to.equal(ethers.parseEther("10"));
    });

    it("Should maintain accurate vote counts with multiple voters", async function () {
      // Deploy additional signers for more comprehensive testing
      const signers = await ethers.getSigners();
      
      // 3 upvotes, 2 downvotes
      await knowledgeHub.connect(signers[2]).voteOnEntry(1, true);
      await knowledgeHub.connect(signers[3]).voteOnEntry(1, true);
      await knowledgeHub.connect(signers[4]).voteOnEntry(1, false);
      await knowledgeHub.connect(signers[5]).voteOnEntry(1, true);
      await knowledgeHub.connect(signers[6]).voteOnEntry(1, false);
      
      const entry = await knowledgeHub.getEntry(1);
      expect(entry.voteCount).to.equal(1); // 3 - 2 = 1
      expect(entry.upvotes).to.equal(3);
      expect(entry.downvotes).to.equal(2);
      
      // Creator should receive 3 * 10 = 30 KNOW tokens
      const creatorBalance = await knowledgeToken.balanceOf(addr1.address);
      expect(creatorBalance).to.equal(ethers.parseEther("30"));
    });
  });
});
