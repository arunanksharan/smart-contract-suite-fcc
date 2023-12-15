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

    uint256 public constant MINIMUM_USD = 2 * 1e18;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;

    // calling this without constant - 2402
    // calling this with constant - 303
    // Deployer becomes the i_owner + Modifier - onlyi_owner
    // without immutable - 751569 | 650427 | 2552
    // with - overall - 728393 | 627917 | 417

    address private immutable i_owner;
    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        require(msg.sender == i_owner, "Sender is not owner");
        // if (msg.sender != i_owner) {revert FundMe__NotOwner();};  // saves a lot of gas
        _;
    }

    constructor(address s_priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(s_priceFeedAddress);
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
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Did not send enough"
        );
        // require(getConversionRate(msg.value) >= minimumUsd, "Did not send enough");  // 1e18 == 1 * 10 ** 18 == 1 eth
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        /* starting index, ending index as condition, step amount*/
        // reset the balance of all funder addresses to 0 in mapping
        // withdraw funds
        // require(msg.sender == i_owner, "Sender is not i_owner");   // converting this to modifier
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        // reset the array
        s_funders = new address[](0);
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

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        // mappings can't be in memory
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call Failed");
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunders() public view returns (address[] memory) {
        return s_funders;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
