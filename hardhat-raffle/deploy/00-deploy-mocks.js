const {
    networkConfig,
    developmentChains,
    BASE_FEE,
    GAS_PRICE_LINK,
} = require("../helper-hardhat-config")
const { network } = require("hardhat")

module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(network.name)) {
        log("Local Network Detected - Deploying Mocks")
        const mockContract = await deploy("VRFCoordinatorV2Mock", {
            contract: "VRFCoordinatorV2Mock",
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
        })
        log("Mock Deployed to:", mockContract.address)
        log("-------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
