// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./KnowledgeToken.sol";

/**
 * @title KnowledgeHub
 * @dev A decentralized platform for sharing and voting on knowledge entries
 * @notice Users can submit knowledge entries and vote on them to earn KNOW tokens
 */
contract KnowledgeHub {
    
    // The KNOW token contract for rewards
    KnowledgeToken public knowledgeToken;
    
    // Reward amount for each upvote (10 KNOW tokens)
    uint256 public constant UPVOTE_REWARD = 10 * 10**18; // 10 tokens with 18 decimals
    
    // Counter for generating unique entry IDs
    uint256 private nextEntryId = 1;
    
    /**
     * @dev Structure to represent a knowledge entry
     */
    struct KnowledgeEntry {
        uint256 id;           // Unique identifier
        address creator;      // Address of the entry creator
        string title;         // Title of the knowledge entry
        string ipfsHash;      // IPFS hash containing the full content
        int256 voteCount;     // Net vote count (upvotes - downvotes)
        uint256 timestamp;    // When the entry was created
        uint256 upvotes;      // Total number of upvotes
        uint256 downvotes;    // Total number of downvotes
    }
    
    // Mapping from entry ID to KnowledgeEntry
    mapping(uint256 => KnowledgeEntry) public entries;
    
    // Mapping to track if a user has voted on a specific entry
    // entryId => voter => hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    // Mapping to track the type of vote a user cast on an entry
    // entryId => voter => isUpvote (true for upvote, false for downvote)
    mapping(uint256 => mapping(address => bool)) public userVotes;
    
    // Array to store all entry IDs for enumeration
    uint256[] public entryIds;
    
    /**
     * @dev Events for tracking contract activity
     */
    event EntrySubmitted(uint256 entryId, address creator, string title, string ipfsHash);
    event EntryVoted(uint256 entryId, address voter, bool upvote);
    event RewardDistributed(uint256 entryId, address creator, uint256 amount);
    
    /**
     * @dev Constructor to initialize the contract with the token address
     * @param _knowledgeToken Address of the KnowledgeToken contract
     */
    constructor(address _knowledgeToken) {
        knowledgeToken = KnowledgeToken(_knowledgeToken);
    }
    
    /**
     * @dev Submit a new knowledge entry
     * @param title The title of the knowledge entry
     * @param ipfsHash The IPFS hash containing the full content
     * @return entryId The unique ID of the created entry
     */
    function submitEntry(string memory title, string memory ipfsHash) 
        public 
        returns (uint256 entryId) 
    {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        entryId = nextEntryId++;
        
        entries[entryId] = KnowledgeEntry({
            id: entryId,
            creator: msg.sender,
            title: title,
            ipfsHash: ipfsHash,
            voteCount: 0,
            timestamp: block.timestamp,
            upvotes: 0,
            downvotes: 0
        });
        
        entryIds.push(entryId);
        
        emit EntrySubmitted(entryId, msg.sender, title, ipfsHash);
        
        return entryId;
    }
    
    /**
     * @dev Vote on a knowledge entry
     * @param entryId The ID of the entry to vote on
     * @param upvote True for upvote, false for downvote
     */
    function voteOnEntry(uint256 entryId, bool upvote) public {
        require(entries[entryId].id != 0, "Entry does not exist");
        require(!hasVoted[entryId][msg.sender], "You have already voted on this entry");
        require(entries[entryId].creator != msg.sender, "Cannot vote on your own entry");
        
        // Mark that the user has voted
        hasVoted[entryId][msg.sender] = true;
        userVotes[entryId][msg.sender] = upvote;
        
        // Update vote counts
        if (upvote) {
            entries[entryId].voteCount += 1;
            entries[entryId].upvotes += 1;
            
            // Distribute reward to the entry creator
            _distributeReward(entryId, entries[entryId].creator);
        } else {
            entries[entryId].voteCount -= 1;
            entries[entryId].downvotes += 1;
        }
        
        emit EntryVoted(entryId, msg.sender, upvote);
    }
    
    /**
     * @dev Internal function to distribute KNOW token rewards
     * @param entryId The ID of the entry that received an upvote
     * @param creator The address of the entry creator
     */
    function _distributeReward(uint256 entryId, address creator) internal {
        // Check if the contract has enough tokens to distribute
        uint256 contractBalance = knowledgeToken.balanceOf(address(this));
        
        if (contractBalance >= UPVOTE_REWARD) {
            // Transfer reward tokens to the creator
            knowledgeToken.transfer(creator, UPVOTE_REWARD);
            emit RewardDistributed(entryId, creator, UPVOTE_REWARD);
        }
        // If not enough tokens, the reward is skipped (could emit a different event)
    }
    
    /**
     * @dev Get details of a specific entry
     * @param entryId The ID of the entry to retrieve
     * @return The complete KnowledgeEntry struct
     */
    function getEntry(uint256 entryId) 
        public 
        view 
        returns (KnowledgeEntry memory) 
    {
        require(entries[entryId].id != 0, "Entry does not exist");
        return entries[entryId];
    }
    
    /**
     * @dev Get the total number of entries
     * @return The total count of submitted entries
     */
    function getEntryCount() public view returns (uint256) {
        return entryIds.length;
    }
    
    /**
     * @dev Get all entry IDs (for pagination in frontend)
     * @return Array of all entry IDs
     */
    function getAllEntryIds() public view returns (uint256[] memory) {
        return entryIds;
    }
    
    /**
     * @dev Get entries by a specific creator
     * @param creator The address of the creator
     * @return Array of entry IDs created by the specified address
     */
    function getEntriesByCreator(address creator) 
        public 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory creatorEntries = new uint256[](entryIds.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < entryIds.length; i++) {
            if (entries[entryIds[i]].creator == creator) {
                creatorEntries[count] = entryIds[i];
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = creatorEntries[i];
        }
        
        return result;
    }
    
    /**
     * @dev Check if a user has voted on a specific entry
     * @param entryId The ID of the entry
     * @param voter The address of the voter
     * @return hasVotedOnEntry True if the user has voted, false otherwise
     * @return isUpvote True if it was an upvote, false if downvote (only valid if hasVotedOnEntry is true)
     */
    function getVoteStatus(uint256 entryId, address voter) 
        public 
        view 
        returns (bool hasVotedOnEntry, bool isUpvote) 
    {
        hasVotedOnEntry = hasVoted[entryId][voter];
        isUpvote = userVotes[entryId][voter];
        return (hasVotedOnEntry, isUpvote);
    }
    
    /**
     * @dev Get the contract's KNOW token balance (for checking reward availability)
     * @return The amount of KNOW tokens held by this contract
     */
    function getContractTokenBalance() public view returns (uint256) {
        return knowledgeToken.balanceOf(address(this));
    }
}
