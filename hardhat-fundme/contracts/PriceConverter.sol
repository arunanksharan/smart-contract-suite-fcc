// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getprice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        // Interacting with a contract outside this project
        // Need address of contract and ABI
        // Goerli - Eth / USD - 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        // (uint80 roundId, int256 price, uint startedAt, uint timeStamp, uint80 answeredInRound) = priceFeed.latestRoundData();
        // price here is Eth in terms of USD has 8 decimal places - 3000.00000000
        // Eth in terms of  wei has 18 decimal places => both need to match up
        // Multiple Eth / USD by 1 * 10 ** 10 to make it have 18 decimal places

        // AggregatorV3Interface priceFeed = AggregatorV3Interface(
        //     0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        // );
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price * 1e10); // 1 * 10 ** 10
    }

    function getVersion() internal view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        );
        return priceFeed.version();
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getprice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}
