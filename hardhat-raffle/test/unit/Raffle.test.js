const { assert, expect } = require("chai")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", function () {
          let raffle,
              vrfCoordinatorV2Mock,
              raffleEntranceFee,
              keyHash,
              subscriptionId,
              callbackGasLimit,
              interval,
              deployer
          const chainId = network.config.chainId

          beforeEach("basic setup and raffle instance", async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              raffle = await ethers.getContract("Raffle", deployer)
              //   console.log("Raffle Address: ", raffle)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
              interval = await raffle.getInterval()
              //   console.log("Type of Interval", typeof interval)
              //   console.log("BigInt Interval as Number", Number(interval) + 1)
          })

          describe("constructor", function () {
              it("initializes the raffle correctly", async function () {
                  // Ideally each test - just 1 assert per it
                  const raffleState = await raffle.getRaffleState()
                  assert.equal(raffleState.toString(), "0")
                  assert.equal(interval.toString(), networkConfig[chainId]["keepersUpdateInterval"])
              })
          })

          describe("enterRaffle", function () {
              it("should not allow entry if not enough eth is sent", async function () {
                  //   const res = await raffle.enterRaffle()
                  //   console.log("res: ", res)
                  await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
                      raffle,
                      //   "Raffle__NotEnoughETHEntered()",
                      "Raffle__NotEnoughETHEntered()",
                  )
              })

              it("records players when they enter", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  const playerFromContract = await raffle.getPlayer(0)
                  assert.equal(playerFromContract, deployer)
              })

              it("emits event on entering", async function () {
                  await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
                      raffle,
                      "Raffle__Enter",
                  )
              })

              it("does not allow entrance when the raffle is being calculated", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.send("evm_mine", [])

                  // Pretend to be a Chainlink Keeper
                  console.log("Pretending to be a Chainlink Keeper")
                  await raffle.performUpkeep("0x")
                  console.log("Called PerformUpkeep")
                  await expect(
                      raffle.enterRaffle({ value: raffleEntranceFee }),
                  ).to.be.revertedWithCustomError(raffle, "Raffle__NotOpen()")
              })
          })

          describe("checkUpkeep", function () {
              it("returns false if people have not sent any ETH", async function () {
                  console.log(
                      "Calling checkUpkeep, checking raffle",
                      raffle.target,
                      raffle.callStatic,
                  )
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.send("evm_mine", [])

                  const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x")
                  assert(!upkeepNeeded)
              })

              it("returns false is raffle is not open", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.send("evm_mine", [])
                  await raffle.performUpkeep("0x")
                  const raffleState = await raffle.getRaffleState()
                  const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x")
                  assert.equal(raffleState.toString(), "1")
                  assert.equal(upkeepNeeded, false)
              })

              it("returns false if enough time hasn't passed", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) + 10]) // use a higher number here if this test fails
                  await network.provider.request({ method: "evm_mine", params: [] })
                  const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert.equal(!upkeepNeeded, false)
              })
              it("returns true if enough time has passed, has players, eth, and is open", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert(upkeepNeeded)
              })
          })

          describe("performUpkeep", function () {
              it("can only run if checkUpkeep is true", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.send("evm_mine", [])

                  const tx = await raffle.performUpkeep("0x")
                  assert(tx)
              })

              it("reverts when checkUpkeep is false", async function () {
                  await expect(raffle.performUpkeep("0x")).to.be.revertedWithCustomError(
                      raffle,
                      "Raffle__UpkeepNotNeeded",
                  )
              })

              it("updates raffle state, emits the event and calls the vrf coordinator", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.send("evm_mine", [])
                  const tx = await raffle.performUpkeep("0x")
                  const txReceipt = await tx.wait(1)
                  console.log("txReceipt: ", txReceipt.logs[1].args.requestId)
                  const requestId = txReceipt.logs[1].args.requestId
                  const raffleState = await raffle.getRaffleState()
                  assert(Number(requestId) > 0)
                  assert.equal(raffleState.toString(), "1")
              })
          })
      })
