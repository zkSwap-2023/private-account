// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.19;

import "@account-abstraction/contracts/samples/TokenPaymaster.sol";

contract PrivatePaymaster is TokenPaymaster {
    constructor(
        address accountFactory,
        string memory _symbol,
        IEntryPoint _entryPoint
    ) TokenPaymaster(accountFactory, _symbol, _entryPoint) {}
    // TODO: Add interface for private txs
}
