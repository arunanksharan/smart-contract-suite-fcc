// SPDX-License-Identifier: LGPL-3.0-only
// Pragma - version of solidity
pragma solidity 0.8.8;

/// @title Raffle Contract
/// @author Irus
// Functionalities
// - Users can enter into the Raffle using a small amount - via enter function
// - Users can see the list of participants - via getPlayers function
// - Users can see the balance of the contract - via getBalance function - total amount of money collected
// - Users can see the address of the manager - via getManager function
// - Users can see the address of the winner - via getWinner function
// - Users can see the address of the last winner - via getLastWinner function
// - The winner is picked randomly - verifiable random
// - Winner automatically selected every x minutes - automated pickWinner function
// - Connected to chainlink oracle -> Randomness, Automated execution (Chainlink Keeper)

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

error Raffle__NotEnoughETHEntered(uint256 minimumEntranceFee, uint256 enteredValue);
error Raffle__WinnerTransferFailed();

contract Raffle is VRFConsumerBaseV2 {
    /* State Variables */
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinatorV2;
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subscriptionId;
    uint16 private constant REQUEST_COMFIRMATIONS = 3;
    uint32 private immutable i_callbackGasLimit;
    uint8 private constant NUM_WORDS = 1;

    // Lottery Variables
    address private s_recentWinner;

    address private immutable i_owner;

    address[] private s_previousWinners;

    /* Events */
    event Raffle__Enter(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event Raffle__Winner(address indexed winner);

    constructor(
        address vrfCoordinatorV2,
        uint256 _entranceFee,
        bytes32 _keyHash,
        uint64 _subscriptionId,
        uint32 _callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_owner = msg.sender;
        i_entranceFee = _entranceFee;
        i_vrfCoordinatorV2 = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_keyHash = _keyHash;
        i_subscriptionId = _subscriptionId;
        i_callbackGasLimit = _callbackGasLimit;
    }

    // - The winner is picked randomly - verifiable random
    function requestRandomWinner() external returns (address) {
        // Request random number
        uint256 requestId = i_vrfCoordinatorV2.requestRandomWords(
            i_keyHash, // gasLane
            i_subscriptionId,
            REQUEST_COMFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedRaffleWinner(requestId);
        // do something with it
        return s_recentWinner;
    }

    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory randomWords
    ) internal override {
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert Raffle__WinnerTransferFailed();
        }
        s_previousWinners.push(recentWinner);
        emit Raffle__Winner(recentWinner);
    }

    // - Users can enter into the Raffle using a small amount - via enter function
    function enterRaffle() public payable returns (bool) {
        // require(msg.value > i_entranceFee, "Not enough money");
        if (msg.value < i_entranceFee) {
            revert Raffle__NotEnoughETHEntered({
                minimumEntranceFee: i_entranceFee,
                enteredValue: msg.value
            });
        }
        s_players.push(payable(msg.sender));

        // Convention is to name the event with the funciton name reversed
        emit Raffle__Enter(msg.sender);
        return true;
    }

    // Users can find out about the entrance fee
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    // Users can find a specific player through index in array
    function getPlayer(uint256 index) public view returns (address payable) {
        return s_players[index];
    }

    // - Users can see the list of participants - via getPlayers function
    function getPlayers() public view returns (address payable[] memory) {
        return s_players;
    }

    // - Users can see the balance of the contract - via getBalance function - total amount of money collected
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // - Users can see the address of the manager - via getManager function
    function getManager() public view returns (address) {
        return i_owner;
    }

    // - Users can see the address of the winner - via getWinner function
    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    // - Users can see the address of the last winner - via getLastWinner function
    function getLastWinner() public view returns (address) {
        return s_previousWinners[s_previousWinners.length - 1];
    }

    // - Winner automatically selected every x minutes - automated pickWinner function
    // - Connected to chainlink oracle -> Randomness, Automated execution (Chainlink Keeper)
}
