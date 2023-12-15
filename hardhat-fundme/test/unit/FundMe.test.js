// console.log("Insidefundme.test.js")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

// describe("FundMe1", async function () {
//     console.log("Inside FundMe1.test.js")
// })

describe("FundMe", async function () {
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.parseEther("1") // 1 ETH
    console.log("Inside FundMe.test.js")

    beforeEach(async function () {
        // deploy our fundMe contract using hardhat-deploy
        // const { deployer } = await getNamedAccounts()
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        // console.log(fundMe)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })
    describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.getPriceFeed()
            console.log(`response is: ${response}`)
            console.log(
                `mockV3Aggregator.address is: ${mockV3Aggregator.target}`
            )
            assert.equal(response, mockV3Aggregator.target)
        })
    })

    describe("fund", async function () {
        it("fails if user does not send minimum eth", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "Did not send enough"
            )
        })
        it("updates the amount funded data structure", async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getAddressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })
        it("adds getFunder to array of getFunder", async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getFunder(0)
            assert.equal(response, deployer)
        })
    })

    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })
        it("withdraws eth from a single founder", async function () {
            // Arrange
            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            )
            console.log(`startingFundMeBalance is: ${startingFundMeBalance}`)
            const startingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )
            console.log(
                `startingDeployerBalance is: ${startingDeployerBalance}`
            )
            // Act
            const txResponse = await fundMe.withdraw()
            const txReceipt = await txResponse.wait(1)
            // console.log(`txReceipt is: ${JSON.stringify(txReceipt)}`)
            const { gasUsed, gasPrice } = txReceipt
            const gasCost = gasPrice * gasUsed
            console.log(`gasCost is: ${gasCost}`)

            const endingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            )
            const endingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )
            // gasCost - from txReceipt

            // Assert
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(
                (startingFundMeBalance + startingDeployerBalance).toString(),
                (endingDeployerBalance + gasCost).toString()
            )
        })
        it("allows us to withdraw with multiple getFunder", async function () {
            // Arrange
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            )
            const startingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )
            // Act
            const txResponse = await fundMe.withdraw()
            const txReceipt = await txResponse.wait(1)
            // console.log(`txReceipt is: ${JSON.stringify(txReceipt)}`)
            const { gasUsed, gasPrice } = txReceipt
            const gasCost = gasPrice * gasUsed
            console.log(`gasCost is: ${gasCost}`)

            const endingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            )
            const endingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )
            // Assert
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(
                (startingFundMeBalance + startingDeployerBalance).toString(),
                (endingDeployerBalance + gasCost).toString()
            )

            // Make sure getFunder are reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted

            for (let i = 1; i < 6; i++) {
                console.log(
                    await fundMe.getAddressToAmountFunded(accounts[i].address)
                )
                console.log(accounts[i].address)

                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })
        it("only allows owner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const nonOwner = accounts[1]
            const nonOwnerConnectedContract = await fundMe.connect(nonOwner)
            await expect(nonOwnerConnectedContract.withdraw()).to.be.reverted
            await expect(
                nonOwnerConnectedContract.withdraw()
            ).to.be.revertedWith("Sender is not owner")
        })

        it("CheaperWithdraw - withdraws eth from a single founder", async function () {
            // Arrange
            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            )
            console.log(`startingFundMeBalance is: ${startingFundMeBalance}`)
            const startingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )
            console.log(
                `startingDeployerBalance is: ${startingDeployerBalance}`
            )
            // Act
            const txResponse = await fundMe.cheaperWithdraw()
            const txReceipt = await txResponse.wait(1)
            // console.log(`txReceipt is: ${JSON.stringify(txReceipt)}`)
            const { gasUsed, gasPrice } = txReceipt
            const gasCost = gasPrice * gasUsed
            console.log(`gasCost is: ${gasCost}`)

            const endingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            )
            const endingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )
            // gasCost - from txReceipt

            // Assert
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(
                (startingFundMeBalance + startingDeployerBalance).toString(),
                (endingDeployerBalance + gasCost).toString()
            )
        })
        it("CheaperWithdraw - gas optimised - allows us to withdraw with multiple getFunder", async function () {
            // Arrange
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            )
            const startingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )
            // Act
            const txResponse = await fundMe.cheaperWithdraw()
            const txReceipt = await txResponse.wait(1)
            // console.log(`txReceipt is: ${JSON.stringify(txReceipt)}`)
            const { gasUsed, gasPrice } = txReceipt
            const gasCost = gasPrice * gasUsed
            console.log(`gasCost is: ${gasCost}`)

            const endingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            )
            const endingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )
            // Assert
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(
                (startingFundMeBalance + startingDeployerBalance).toString(),
                (endingDeployerBalance + gasCost).toString()
            )

            // Make sure getFunder are reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted

            for (let i = 1; i < 6; i++) {
                console.log(
                    await fundMe.getAddressToAmountFunded(accounts[i].address)
                )
                console.log(accounts[i].address)

                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })
    })
})
