const {ethers} = require("hardhat")
const {expect, assert} = require("chai")

describe("SimpleStorage", function () {
  let simpleStorageFactory, simpleStorage

  beforeEach(async function () {
    simpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
    simpleStorage = await simpleStorageFactory.deploy()
  })

  it("should start with a favorite number of 0", async function () {
    const currentValue = await simpleStorage.retrieve()
    const expectedValue = "0"
    // expect(await simpleStorage.retrieve()).to.equal(0)
    assert.equal(currentValue.toString(), expectedValue)
  })
  // it.only() => will only run this test
  // it.skip() => will skip this test
  // from cmd line - npx hardhat test --grep store => will search and only run tests with "store" in the name
  it("should be able to store our favorite number", async function () {
    const expectedValue = "7"
    const storesTxResponse = await simpleStorage.store(expectedValue)
    await storesTxResponse.wait(1)
    const currentValue = await simpleStorage.retrieve()
    assert(currentValue.toString(), expectedValue)
  })

})