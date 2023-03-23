// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DummyToken is ERC20 {
    constructor() ERC20("DUMMY TOKEN", "DTKN") {}

    function mint(address to) external {
        _mint(to, 420 ether);
    }
}
