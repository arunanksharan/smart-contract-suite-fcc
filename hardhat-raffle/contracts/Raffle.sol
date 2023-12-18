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
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

// error Raffle__NotEnoughETHEntered(uint256 minimumEntranceFee, uint256 enteredValue);
error Raffle__NotEnoughETHEntered();
error Raffle__WinnerTransferFailed();
error Raffle__NotOpen();
error Raffle__UpkeepNotNeeded(uint256 currentBalance, uint256 numberOfPlayers, uint256 raffleState);

/**
 * @title A Sample Raffle Contract
 * @author Irus
 * @notice This contract is for creating an untamperable decentralised smart contract
 * @dev This contract implements Chainlink VRF V2 to generate a random number which in turn is used to pick the winner in an automated way using Chainlink Keeper
 */

contract Raffle is VRFConsumerBaseV2, AutomationCompatible {
    /* Types */
    enum RaffleState {
        OPEN,
        CALCULATING,
        CLOSED
    }

    /* State Variables */
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinatorV2;
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subscriptionId;
    uint16 private constant REQUEST_COMFIRMATIONS = 3;
    uint32 private immutable i_callbackGasLimit;
    uint8 private constant NUM_WORDS = 1;

    // Raffle Variables
    address private s_recentWinner;
    RaffleState private s_raffleState;
    address private immutable i_owner;
    uint256 private s_lastTimeStamp;
    uint256 private immutable i_interval;

    address[] private s_previousWinners;

    /* Events */
    event Raffle__Enter(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event Raffle__Winner(address indexed winner);

    /* Constructor */
    constructor(
        address vrfCoordinatorV2,
        uint256 _entranceFee,
        bytes32 _keyHash,
        uint64 _subscriptionId,
        uint32 _callbackGasLimit,
        uint256 _interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_owner = msg.sender;
        i_entranceFee = _entranceFee;
        i_vrfCoordinatorV2 = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_keyHash = _keyHash;
        i_subscriptionId = _subscriptionId;
        i_callbackGasLimit = _callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_interval = _interval;
    }

    /* Modifiers */

    /* Functions */

    /**@dev This is the function Chainlink upkeep nodes call and look for upkeepNeeded to return  true
     * The following should be true in order to return true
     * 1. Our time interval should have passed
     * 2. Lottery should have atleast 1 player and some Eth
     * 3. Our subscription is funded with Link
     * 4. Our Raffle contract is in "open" state - closed state when requested for randomword
     * @return upkeepNeeded - boolean value to indicate whether or not upkeep is needed
     *
     */

    function checkUpkeep(
        bytes memory /* checkData */
    ) public view override returns (bool upkeepNeeded, bytes memory /* performData */) {
        bool isOpen = (RaffleState.OPEN == s_raffleState);
        bool hasPlayers = (s_players.length > 0);
        bool hasBalance = (address(this).balance > 0);
        // bool hasFunds = (i_vrfCoordinatorV2.getSubscriptionBalance(i_subscriptionId) > 0);
        bool intervalPassed = ((block.timestamp - s_lastTimeStamp) > i_interval); // interval in seconds - how long to wait between consecutive declarations
        upkeepNeeded = (isOpen && hasPlayers && hasBalance && intervalPassed);
        return (upkeepNeeded, "");
    }

    // - The winner is picked randomly - verifiable random
    function performUpkeep(bytes calldata /* performData */) external override {
        // call checkUpkeep and see if needed
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert Raffle__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }

        // Request random number - requestRandomWinner - converted to performUpkeep
        s_raffleState = RaffleState.CALCULATING;
        uint256 requestId = i_vrfCoordinatorV2.requestRandomWords(
            i_keyHash, // gasLane
            i_subscriptionId,
            REQUEST_COMFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedRaffleWinner(requestId);
        // do something with it
        // return s_recentWinner;
    }

    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory randomWords
    ) internal override {
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner; // This is the winner
        s_players = new address payable[](0); // Reset the players array
        s_lastTimeStamp = block.timestamp; // Reset the timer
        s_raffleState = RaffleState.OPEN;
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
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__NotOpen();
        }
        if (msg.value < i_entranceFee) {
            revert Raffle__NotEnoughETHEntered();
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

    // - Users can see the number of participants
    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    // Latest timestamp
    function getLatestTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    // Get number of request confirmations
    function getRequestConfirmations() public pure returns (uint16) {
        return REQUEST_COMFIRMATIONS;
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

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    // - Winner automatically selected every x minutes - automated pickWinner function
    // - Connected to chainlink oracle -> Randomness, Automated execution (Chainlink Keeper)
}
