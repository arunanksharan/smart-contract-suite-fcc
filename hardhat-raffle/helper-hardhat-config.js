const { ethers } = require("hardhat")

const networkConfig = {
    default: {
        name: "hardhat",
        keepersUpdateInterval: "30",
    },
    5: {
        name: "goerli",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        raffleEntranceFee: ethers.parseEther("0.01"), // 0.01 ETH
        subscriptionId: "16502",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", // 30 gwei
        keepersUpdateInterval: "30",
        callbackGasLimit: "500000", // 500,000 gas
    },
    31337: {
        name: "localhost",
        raffleEntranceFee: ethers.parseEther("0.01"), // 0.01 ETH
        subscriptionId: "588",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
        keepersUpdateInterval: "30",
        callbackGasLimit: "500000", // 500,000 gas
    },
    11155111: {
        name: "sepolia",
        raffleEntranceFee: ethers.parseEther("0.01"), // 0.01 ETH
        subscriptionId: "7843",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
        keepersUpdateInterval: "30",
        callbackGasLimit: "500000", // 500,000 gas
        vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    },
    1: {
        name: "mainnet",
        raffleEntranceFee: ethers.parseEther("0.01"), // 0.01 ETH
        keepersUpdateInterval: "30",
    },
}

const developmentChains = ["hardhat", "localhost"]
const BASE_FEE = ethers.parseEther("0.25") // 0.25 is the premium - costs 0.25 per request
const GAS_PRICE_LINK = 1e9 // Gas per link - Calculated value based on gas price of chain
const VERIFICATION_BLOCK_CONFIRMATIONS = 6
const VRF_MOCK_SUB_FUND_AMOUNT = ethers.parseEther("30") // 1 LINK
const frontEndContractsFile = "../nextjs-smartcontract-lottery-fcc/constants/contractAddresses.json"
const frontEndAbiFile = "../nextjs-smartcontract-lottery-fcc/constants/abi.json"

module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    frontEndContractsFile,
    frontEndAbiFile,
    BASE_FEE,
    GAS_PRICE_LINK,
    VRF_MOCK_SUB_FUND_AMOUNT,
}
