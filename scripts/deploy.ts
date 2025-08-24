import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting deployment of Knowledge Hub contracts...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy KnowledgeToken first
  console.log("🪙 Deploying KnowledgeToken...");
  const KnowledgeTokenFactory = await ethers.getContractFactory("KnowledgeToken");
  const knowledgeToken = await KnowledgeTokenFactory.deploy(deployer.address);
  await knowledgeToken.waitForDeployment();
  
  const tokenAddress = await knowledgeToken.getAddress();
  console.log("✅ KnowledgeToken deployed to:", tokenAddress);
  console.log("   - Name:", await knowledgeToken.name());
  console.log("   - Symbol:", await knowledgeToken.symbol());
  console.log("   - Owner:", await knowledgeToken.owner());
  console.log();

  // Deploy KnowledgeHub
  console.log("🏛️  Deploying KnowledgeHub...");
  const KnowledgeHubFactory = await ethers.getContractFactory("KnowledgeHub");
  const knowledgeHub = await KnowledgeHubFactory.deploy(tokenAddress);
  await knowledgeHub.waitForDeployment();
  
  const hubAddress = await knowledgeHub.getAddress();
  console.log("✅ KnowledgeHub deployed to:", hubAddress);
  console.log("   - Token address:", await knowledgeHub.knowledgeToken());
  console.log("   - Upvote reward:", ethers.formatEther(await knowledgeHub.UPVOTE_REWARD()), "KNOW");
  console.log();

  // Mint initial tokens to the hub contract for reward distribution
  const initialRewardPool = ethers.parseEther("100000"); // 100,000 KNOW tokens
  console.log("💎 Minting initial reward pool...");
  console.log("   - Amount:", ethers.formatEther(initialRewardPool), "KNOW tokens");
  
  const mintTx = await knowledgeToken.mint(hubAddress, initialRewardPool);
  await mintTx.wait();
  
  const hubTokenBalance = await knowledgeToken.balanceOf(hubAddress);
  console.log("✅ Reward pool minted successfully");
  console.log("   - Hub contract balance:", ethers.formatEther(hubTokenBalance), "KNOW");
  console.log();

  // Optional: Mint some tokens to the deployer for testing
  const deployerTokens = ethers.parseEther("10000"); // 10,000 KNOW tokens
  console.log("🎁 Minting tokens to deployer for testing...");
  const deployerMintTx = await knowledgeToken.mint(deployer.address, deployerTokens);
  await deployerMintTx.wait();
  
  const deployerBalance = await knowledgeToken.balanceOf(deployer.address);
  console.log("✅ Deployer tokens minted");
  console.log("   - Deployer balance:", ethers.formatEther(deployerBalance), "KNOW");
  console.log();

  // Display final summary
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(50));
  console.log("📋 Contract Addresses:");
  console.log("   🪙 KnowledgeToken:", tokenAddress);
  console.log("   🏛️  KnowledgeHub:  ", hubAddress);
  console.log();
  console.log("📊 Token Distribution:");
  console.log("   💎 Reward Pool:    ", ethers.formatEther(hubTokenBalance), "KNOW");
  console.log("   🎁 Deployer:       ", ethers.formatEther(deployerBalance), "KNOW");
  console.log("   📈 Total Supply:   ", ethers.formatEther(await knowledgeToken.totalSupply()), "KNOW");
  console.log();
  console.log("🚀 Ready for hackathon demo!");
  console.log("   - Users can now submit knowledge entries");
  console.log("   - Voting rewards are funded and ready");
  console.log("   - Each upvote rewards", ethers.formatEther(await knowledgeHub.UPVOTE_REWARD()), "KNOW tokens");
  console.log();

  // Save deployment info to a file for frontend integration
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      KnowledgeToken: {
        address: tokenAddress,
        name: await knowledgeToken.name(),
        symbol: await knowledgeToken.symbol()
      },
      KnowledgeHub: {
        address: hubAddress,
        upvoteReward: ethers.formatEther(await knowledgeHub.UPVOTE_REWARD())
      }
    },
    tokenDistribution: {
      rewardPool: ethers.formatEther(hubTokenBalance),
      deployer: ethers.formatEther(deployerBalance),
      totalSupply: ethers.formatEther(await knowledgeToken.totalSupply())
    }
  };

  // Note: In a real deployment, you might want to save this to a JSON file
  console.log("📄 Deployment info (save this for frontend integration):");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

// Handle deployment errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
