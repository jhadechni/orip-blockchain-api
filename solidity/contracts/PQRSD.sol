//SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PQRSD is Ownable {
    using Counters for Counters.Counter;
    mapping(address => uint256) currentTicket;
}
