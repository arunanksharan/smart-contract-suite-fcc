const { assert, expect } = require("chai")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

// Only run on testnet and mainnet
developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", function () {
          let raffle, raffleEntranceFee, deployer

          beforeEach("basic setup and raffle instance", async function () {
              deployer = (await getNamedAccounts()).deployer
              raffle = await ethers.getContract("Raffle", deployer)
              //   console.log("Raffle Address: ", raffle)
              raffleEntranceFee = await raffle.getEntranceFee()
          })

          describe("fulfillRandomeWords", function () {
              it("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async () => {
                  // enter the raffle is the only action we can take
                  const startingTimeStamp = await raffle.getLatestTimeStamp() // stores starting timestamp (before we fire our event)
                  const accounts = await ethers.getSigners()

                  //   const additionalEntrances = 3 // to test
                  //   const startingIndex = 2

                  //   let startingBalance
                  //   for (let i = startingIndex; i < startingIndex + additionalEntrances; i++) {
                  //       // i = 2; i < 5; i=i+1
                  //       accountConnectedRaffle = raffle.connect(accounts[i]) // Returns a new instance of the Raffle contract connected to player
                  //       await accountConnectedRaffle.enterRaffle({ value: raffleEntranceFee })
                  //   }

                  // This will be more important for our staging tests...
                  // setup listener before we enter raffle
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired!")

                          try {
                              // Now lets get the ending values...
                              const recentWinner = await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              const winnerBalance = await ethers.provider.getBalance(
                                  accounts[0].address,
                              )
                              const endingTimeStamp = await raffle.getLatestTimeStamp()
                              await expect(raffle.getPlayer(0)).to.be.reverted

                              // Comparisons to check if our ending values are correct:
                              assert.equal(recentWinner.toString(), accounts[0].address)
                              assert.equal(raffleState, 0)
                              assert.equal(
                                  winnerBalance.toString(),

                                  (
                                      startingBalance +
                                      (BigInt(raffleEntranceFee) * BigInt(additionalEntrances) +
                                          BigInt(raffleEntranceFee))
                                  ).toString(),
                              )
                              assert(endingTimeStamp > startingTimeStamp)
                              resolve() // if try passes, resolves the promise
                          } catch (e) {
                              reject(e) // if try fails, rejects the promise
                          }
                      })
                      // Entering raffle
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      startingBalance = await ethers.provider.getBalance(accounts[0].address)
                  })
              })
          })
      })
