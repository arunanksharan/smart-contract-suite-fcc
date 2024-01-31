const {
    networkConfig,
    developmentChains,
    VRF_MOCK_SUB_FUND_AMOUNT,
} = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock

    if (developmentChains.includes(network.name)) {
        // let vrfCoordinatorV2Mock = await deployments.get("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = (await deployments.get("VRFCoordinatorV2Mock")).address
        vrfCoordinatorV2Mock = await ethers.getContractAt(
            "VRFCoordinatorV2Mock",
            vrfCoordinatorV2Address,
        )

        console.log("VRFCoordinatorV2Mock deployed to:", vrfCoordinatorV2Address)
        // console.log("Contract Mock VRF is: ", vrfCoordinatorV2Mock)

        const txResponse = await vrfCoordinatorV2Mock.createSubscription()
        console.log("Waiting for transaction to be mined...")
        console.log("Transaction hash:", txResponse.hash)

        const txReceipt = await txResponse.wait(1)
        // console.log("Subscription ID:", txReceipt)
        // console.log("Subscription ID:", txReceipt.events[0].args.subId.toString())
        // subscriptionId = txReceipt.events[0].args.subId    // in course ethers v5
        subscriptionId = txReceipt.logs[0].args.subId
        console.log("Subscription ID:", subscriptionId.toString())
        // Fund this subscription - real network - use link token
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_MOCK_SUB_FUND_AMOUNT)
        console.log("Subscription Funded, exiting if statement")
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    const entranceFee = networkConfig[chainId]["raffleEntranceFee"]
    console.log("Entrance Fee:", entranceFee.toString())
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    console.log("Callback Gas Limit:", callbackGasLimit.toString())
    const keyHash = networkConfig[chainId]["gasLane"] // same as gasLane mentioned by FreeCodeCamp
    console.log("Key Hash:", keyHash.toString())
    const interval = networkConfig[chainId]["keepersUpdateInterval"]
    console.log("Keepers Update Interval:", interval.toString())

    const args = [
        vrfCoordinatorV2Address,
        entranceFee,
        keyHash,
        subscriptionId,
        callbackGasLimit,
        interval,
    ]

    console.log("Deploying contract...")
    console.log("Arguments:", args)

    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    console.log(
        `Waiting for block confirmations... of ${network.config.blockConfirmations || 1} blocks`,
    )
    console.log("Raffle contract adddress:", raffle.address)
    // In latest version of Chainlink/contracts 0.6.1 or after 0.4.1, we need to add consumer explicitly after deployment of contract
    if (developmentChains.includes(network.name)) {
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address)
        log("Consumer is added")
    }
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying on Etherscan....")
        await verify(raffle.address, args)
    }
    log("-------------------------------------")
}

module.exports.tags = ["all", "raffle"]
