# 🧠 Knowledge Hub - Decentralized Knowledge Sharing Platform

A blockchain-based platform where users can submit knowledge entries, vote on content, and earn KNOW tokens for valuable contributions. Built with Solidity ^0.8.20, Hardhat, and TypeScript.

## 🎯 Demo Ready Features

- **📝 Knowledge Entry Submission**: Users can submit knowledge with IPFS content storage
- **🗳️ Democratic Voting System**: Community-driven upvote/downvote mechanism
- **🪙 Token Rewards**: Earn 10 KNOW tokens for each upvote received
- **🔒 Anti-Gaming Protection**: Prevents double voting and self-voting
- **📊 Comprehensive Analytics**: Track votes, creators, and token distribution

## 🏗️ Smart Contracts

### KnowledgeToken.sol
- **ERC20 Token**: Standard compliant with mint/burn functionality
- **Symbol**: KNOW
- **Decimals**: 18
- **Owner-Only Minting**: Controlled token supply
- **OpenZeppelin Integration**: Battle-tested security

### KnowledgeHub.sol
- **Entry Management**: Submit knowledge with title + IPFS hash
- **Voting Logic**: Upvote/downvote with duplicate prevention
- **Reward Distribution**: Automatic KNOW token rewards for upvotes
- **Data Retrieval**: Query entries by ID, creator, or get all entries

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Compile Contracts
```bash
npx hardhat compile
```

### Run Tests
```bash
npx hardhat test
```

### Deploy to Local Network
```bash
# Start local blockchain
npx hardhat node

# Deploy contracts (in another terminal)
npx hardhat run scripts/deploy.ts --network localhost
```

## 🧪 Testing

Comprehensive test suite covering:
- ✅ Token minting and burning
- ✅ Entry submission validation
- ✅ Voting logic and restrictions
- ✅ Reward distribution
- ✅ Anti-gaming measures
- ✅ Complex voting scenarios

```bash
# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run specific test file
npx hardhat test test/KnowledgeToken.test.ts
npx hardhat test test/KnowledgeHub.test.ts
```

## 📋 Contract Interactions

### Submit Knowledge Entry
```typescript
await knowledgeHub.submitEntry(
  "Introduction to Blockchain", 
  "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
);
```

### Vote on Entry
```typescript
// Upvote (rewards creator with 10 KNOW tokens)
await knowledgeHub.voteOnEntry(1, true);

// Downvote
await knowledgeHub.voteOnEntry(1, false);
```

### Query Entries
```typescript
// Get specific entry
const entry = await knowledgeHub.getEntry(1);

// Get all entry IDs
const allIds = await knowledgeHub.getAllEntryIds();

// Get entries by creator
const userEntries = await knowledgeHub.getEntriesByCreator(userAddress);
```

## 🎮 Demo Scenarios

### Scenario 1: Knowledge Contributor
1. Submit a knowledge entry with IPFS content
2. Receive upvotes from community
3. Earn KNOW tokens automatically
4. Track your contributions and rewards

### Scenario 2: Community Curator
1. Browse submitted knowledge entries
2. Vote on quality content (upvote/downvote)
3. Help surface valuable knowledge
4. Participate in decentralized curation

### Scenario 3: Token Economics
1. View reward pool in hub contract
2. Track token distribution
3. Monitor voting activity
4. Analyze platform engagement

## 🔧 Configuration

### Hardhat Config
- **Solidity Version**: ^0.8.20
- **TypeScript Support**: Full integration
- **OpenZeppelin**: Latest contracts
- **Gas Reporting**: Available with REPORT_GAS=true

### Deployment Settings
- **Initial Reward Pool**: 100,000 KNOW tokens
- **Upvote Reward**: 10 KNOW tokens
- **Deployer Tokens**: 10,000 KNOW tokens (for testing)

## 📊 Key Metrics

- **Entry Submission**: Gas efficient with IPFS storage
- **Voting Mechanism**: Prevents gaming with comprehensive checks
- **Token Rewards**: Automatic distribution on upvotes
- **Data Queries**: Multiple access patterns supported

## 🛡️ Security Features

- **OpenZeppelin Contracts**: Industry-standard security
- **Access Control**: Owner-only token minting
- **Vote Validation**: Prevents double voting and self-voting
- **Input Validation**: Comprehensive parameter checking

## 📁 Project Structure

```
contracts/
├── KnowledgeToken.sol    # ERC20 token with mint/burn
└── KnowledgeHub.sol      # Main platform logic

test/
├── KnowledgeToken.test.ts # Token contract tests
└── KnowledgeHub.test.ts   # Hub contract tests

scripts/
└── deploy.ts             # Deployment script with initialization

ignition/modules/         # Hardhat Ignition modules
```

## 🎯 Highlights

- **Complete DApp Backend**: Ready for frontend integration
- **Token Economics**: Built-in incentive mechanism
- **IPFS Integration**: Decentralized content storage
- **Community Governance**: Democratic voting system
- **Scalable Architecture**: Modular and extensible design

## 🚀 Next Steps for Production

1. **Frontend Development**: React/Next.js integration
2. **IPFS Gateway**: Content serving infrastructure  
3. **Advanced Features**: Categories, search, reputation
4. **Mobile App**: React Native implementation
5. **Governance**: DAO functionality for platform decisions

---

**Built and designed for the future of decentralized knowledge sharing! 🌟**
