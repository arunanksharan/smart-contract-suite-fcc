// SPDX-License-Identifier: LGPL-3.0-only
// Pragma - version of solidity
pragma solidity 0.8.8;

// Imports
import "./PriceConverter.sol";

// Error Codes
// From solidity ^0.8.4 => use a separate error function and call this
// error FundMe__NotOwner();

// Interfaces
// Libraries
// Contracts

// Functionalitites:
// Get Funds from users
// Withdraw funds
// Set a minimum funding value in USD

// Allows people to fund collective good - any blokcchain native token into this contract
// Deploy to testnet
// Chainlink price feeds
// Set a minimum funding value in USD

// transaction has
// nonce, gas price, gas limit, data, value, v,r,s, to

// original - tx cost - 771495 | exec cost - 670325
// with constant - 751569 | 650427
// with immutable -

/** @title A contract for crowd funding
 * @dev This contract allows people to fund collective good - any blokcchain native token into this contract
 */

contract FundMe {
    // Type declaration
    // State variables
    // Events
    // Errors
    // Modifiers
    // Functions
    // - Constructor
    // - Receive
    // - Fallback
    // - External
    // - Public
    // - Internal
    // - Private

    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    // calling this without constant - 2402
    // calling this with constant - 303
    // Deployer becomes the owner + Modifier - onlyOwner
    // without immutable - 751569 | 650427 | 2552
    // with - overall - 728393 | 627917 | 417

    address public immutable owner;
    AggregatorV3Interface public priceFeed;

    modifier onlyOwner() {
        require(msg.sender == owner, "Sender is not owner");
        // if (msg.sender != owner) {revert FundMe__NotOwner();};  // saves a lot of gas
        _;
    }

    constructor(address priceFeedAddress) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        // Want to be able to set a minimum fund amount in USD
        // 1. How do we send ETH to this
        require(
            msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
            "Did not send enough"
        );
        // require(getConversionRate(msg.value) >= minimumUsd, "Did not send enough");  // 1e18 == 1 * 10 ** 18 == 1 eth
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        /* starting index, ending index as condition, step amount*/
        // reset the balance of all funder addresses to 0 in mapping
        // withdraw funds
        // require(msg.sender == owner, "Sender is not owner");   // converting this to modifier
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }

        // reset the array
        funders = new address[](0);
        // Methods to send money from contract - transfer, send, call
        // transfer - convert msg.sender into payable address type | if fails, throws error and reverts
        // payable(msg.sender).transfer(address(this).balance);

        // send - if fails, returns a boolean
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send Failed");

        // call - lower level command - call virtually any function without knowing ABI |
        // Recommended way to send & receive ethereum and blockchain native token
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call Failed");
    }
}
