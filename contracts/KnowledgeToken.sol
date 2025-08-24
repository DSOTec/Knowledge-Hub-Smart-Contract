// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KnowledgeToken
 * @dev ERC20 token for rewarding knowledge contributors in the Knowledge Hub
 * @notice This token is minted by the owner to reward users for quality knowledge submissions
 */
contract KnowledgeToken is ERC20, Ownable {
    
    /**
     * @dev Constructor that sets the token name and symbol
     * @param initialOwner The address that will own this contract
     */
    constructor(address initialOwner) 
        ERC20("KnowledgeToken", "KNOW") 
        Ownable(initialOwner) 
    {
        // Initial supply can be minted by owner as needed
    }

    /**
     * @dev Mints new tokens to a specified address
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint (in wei)
     * @notice Only the contract owner can mint new tokens
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Burns tokens from the caller's balance
     * @param amount The amount of tokens to burn (in wei)
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Burns tokens from a specified address (requires allowance)
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn (in wei)
     */
    function burnFrom(address from, uint256 amount) public {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
    }
}
