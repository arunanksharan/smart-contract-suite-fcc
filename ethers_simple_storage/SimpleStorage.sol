// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity 0.8.7;

// pragma solidity >=0.7.0 <0.9.0;

contract SimpleStorage {
  // boolean, uint, int, address, bytes
  bool hasFavoriteNumber = false;
  uint256 favoriteNumberInit = 5;
  string favoriteNumberInText = "Five";
  int256 favoriteInt = -5;
  address myAddress = 0xA961BF111DA182063cd6D2E7396dF9d8CA044fAa;
  bytes32 favoriteBytes = "cat";

  uint256 public favoriteNumber;
  People public person = People({favoriteNumber: 2, name: "Pat"});

  struct People {
    uint256 favoriteNumber;
    string name;
  }

  mapping(string => uint256) public nameToFavoriteNumber;

  uint256[] public favoriteNumbersList;
  People[] public people;

  function store(uint256 _favoriteNumber) public virtual {
    favoriteNumber = _favoriteNumber;
  }

  function retrieve() public view returns (uint256) {
    return favoriteNumber;
  }

  function addPerson(string memory _name, uint256 _favoriteNumber) public {
    People memory newPerson = People({
      favoriteNumber: _favoriteNumber,
      name: _name
    });
    people.push(newPerson);
    nameToFavoriteNumber[_name] = _favoriteNumber;
    favoriteNumbersList.push(_favoriteNumber);
  }
}
