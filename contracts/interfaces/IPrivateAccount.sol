// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.19;

import "@account-abstraction/contracts/interfaces/IAccount.sol";

interface IPrivateAccount is IAccount {
    event DoxxedAddressHashAdded(bytes32 indexed addressHash);
    event DoxxedAddressHashRemoved(bytes32 indexed addressHash);

    /**
     * @return array of hashes of doxxed addresses
     */
    function getDoxxedAddressHashes() external view returns (bytes32[] memory);

    /**
     * @return whether or not address hash is doxxed
     */
    function isDoxxedAddressHash(
        bytes32 addressHash
    ) external view returns (bool);

    /**
     * add a hash of doxxed address
     * @param addressHash hash of doxxed address
     */
    function addDoxxedAddressHash(bytes32 addressHash) external;

    /**
     * remove a hash of doxxed address
     * @param addressHash hash of doxxed address
     */
    function removeDoxxedAddressHash(bytes32 addressHash) external;
}
