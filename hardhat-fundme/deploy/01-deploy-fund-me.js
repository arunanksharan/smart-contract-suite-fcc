// import
// main
// call main

// hardhat deploy is different from hardhat run scripts/deploy.js
// Method 1: hardhat deploy using deployFunc
// function deployFunc(hre) {
//     console.log("Deploying contract...")
// }

// module.exports.default = deployFunc

// Method 2: hardhat deploy using anonymous function with async
const { networkConfig, developmentChains } = require("../helper-hardhat-config") // destrucutre networkConfig from helperConfig
// Same as below import of 2 step process
// const helperConfig = require("../helper-hardhat-config")
// const networkConfig = helperConfig.networkConfig

const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // When going for localhost or hardhat network, we can use mock
    // if chainId === x, use address xaddress
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // if contract does not existenceToInt, deploy mock contracts for local testing
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        // args: [
        //     /* arguments - price feed chainlink contract address */
        //     ethUsdPriceFeedAddress,
        // ],
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    console.log(
        `Waiting for block confirmations... of ${
            network.config.blockConfirmations || 1
        } blocks`
    )

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log("-------------------------------------")
}
module.exports.tags = ["all", "fundme"]
