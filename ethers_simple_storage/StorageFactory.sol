// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity 0.8.7;
// pragma solidity >=0.7.0 <0.9.0;

import "./SimpleStorage.sol";

contract StorageFactory {
    SimpleStorage[] public simpleStorageList;

    function createSimpleStorageContract() public {
        SimpleStorage simpleStorage = new SimpleStorage();
        simpleStorageList.push(simpleStorage);
    }

    function sfStore(
        uint256 _simpleStorageIndex,
        uint256 _simpleStorageNumber
    ) public {
        // Address + ABI
        SimpleStorage simpleStorage = simpleStorageList[_simpleStorageIndex];
        simpleStorage.store(_simpleStorageNumber);
    }

    function sfGet(uint256 _simpleStorageIndex) public view returns (uint256) {
        SimpleStorage simpleStorage = simpleStorageList[_simpleStorageIndex];
        return simpleStorage.retrieve();
    }
}
