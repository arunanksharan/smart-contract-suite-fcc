// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

constract Rupee is ERC20 {

    // intial supply of 1000000 tokens
    uint256 public constant INITIAL_SUPPLY = 1000000000000000000000000;
    constructor() ERC20("Rupee", "RS") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}