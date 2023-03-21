// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.19;

// External Dependencies
import "@account-abstraction/contracts/core/BaseAccount.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Local Dependencies
import "../interfaces/IPrivateAccount.sol";
import "hardhat/console.sol";

contract PrivateAccount is BaseAccount, IPrivateAccount, Ownable {
    using ECDSA for bytes32;

    /*//////////////////////////////////////////////////////////////
                            STORAGE VARIABLES
    //////////////////////////////////////////////////////////////*/

    uint96 private _nonce;
    IEntryPoint private immutable _entryPoint;
    bool private _initialized;
    mapping(bytes32 => bool) private _isDoxxedAddressHash;
    bytes32[] private _doxxedAddressHashes;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event PrivateAccountInitialized(
        IEntryPoint indexed entryPoint,
        address indexed owner
    );

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(IEntryPoint entryPoint_) {
        _entryPoint = entryPoint_;
    }

    /*//////////////////////////////////////////////////////////////
                             GETTERS
    //////////////////////////////////////////////////////////////*/

    /// @inheritdoc BaseAccount
    function nonce() public view virtual override returns (uint256) {
        return _nonce;
    }

    /// @inheritdoc BaseAccount
    function entryPoint() public view virtual override returns (IEntryPoint) {
        return _entryPoint;
    }

    function initialized() public view returns (bool) {
        return _initialized;
    }

    function getDoxxedAddressHashes() public view returns (bytes32[] memory) {
        return _doxxedAddressHashes;
    }

    function isDoxxedAddressHash(
        bytes32 addressHash
    ) public view returns (bool) {
        return _isDoxxedAddressHash[addressHash];
    }

    /**
     *  Takes an address and returns its hash
     *  @param addr the address to be hashed
     *  @notice this can be used to add/remove address hashes from doxxed address hashes
     */
    function hashAddress(address addr) public pure returns (bytes32) {
        return _hashAddress(addr);
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    /*//////////////////////////////////////////////////////////////
                            EXTERNALS
    //////////////////////////////////////////////////////////////*/

    /**
     *  execute one or multiple transactions
     *  @param dest array of destination contract addresses
     *  @param value array of values to transfer
     *  @dev value cannot be empty, use 0 values
     *  @param func array of abi encoded functions with calldata
     */
    function execute(address[] calldata dest, uint256[] calldata value, bytes[] calldata func) external {
        _requireFromEntryPointOrOwner();
        require(dest.length == func.length, "wrong array lengths");
        for (uint256 i = 0; i < dest.length; i++) {
            _requireDestNotDoxxed(dest[i]);
            (bool success, bytes memory result) = dest[i].call{value: value[i]}(
                func[i]
            );
            if (!success) {
                assembly {
                    revert(add(result, 32), mload(result))
                }
            }
        }
    }

    /// Can only be initialized ONCE
    function initialize(address owner) external {
        _initialize(owner);
    }

    /// @inheritdoc IPrivateAccount
    function addDoxxedAddressHash(bytes32 addressHash) external {
        _requireFromEntryPointOrOwner();
        _addDoxxedAddressHash(addressHash);
    }

    /// @inheritdoc IPrivateAccount
    function removeDoxxedAddressHash(bytes32 addressHash) external {
        _requireFromEntryPointOrOwner();
        _removeDoxxedAddressHash(addressHash);
    }

    /*//////////////////////////////////////////////////////////////
                            INTERNALS
    //////////////////////////////////////////////////////////////*/

    function _initialize(address owner) internal virtual {
        require(!_initialized, "Contract has been initialized already");
        _initialized = true;
        _transferOwnership(owner);
        emit PrivateAccountInitialized(_entryPoint, owner);
    }

    function _hashAddress(address addr) internal pure returns (bytes32) {
        return keccak256(abi.encode(addr));
    }

    /// Require the function call went through EntryPoint or owner
    function _requireFromEntryPointOrOwner() internal view {
        require(
            msg.sender == address(entryPoint()) || msg.sender == owner(),
            "account: not Owner or EntryPoint"
        );
    }

    /// Require the destination address is not doxxed
    function _requireDestNotDoxxed(address dest) internal view {
        require(
            !_isDoxxedAddressHash[hashAddress(dest)],
            "Doxxed: Destination Account is Doxxed"
        );
    }

    /// implementation of method from BaseAccount
    function _validateAndUpdateNonce(
        UserOperation calldata userOp
    ) internal override {
        require(_nonce++ == userOp.nonce, "account: invalid nonce");
    }

    /// implementation of method from BaseAccount
    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal virtual override returns (uint256 validationData) {
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        if (owner() != hash.recover(userOp.signature))
            return SIG_VALIDATION_FAILED;
        return 0;
    }

    /// add address hash mapping and push to doxxed address hash array
    function _addDoxxedAddressHash(bytes32 addressHash) internal {
        _isDoxxedAddressHash[addressHash] = true;
        _doxxedAddressHashes.push(addressHash);
        emit DoxxedAddressHashAdded(addressHash);
    }

    /// delete address hash mapping and pop from doxxed address hash array
    function _removeDoxxedAddressHash(bytes32 addressHash) internal {
        delete _isDoxxedAddressHash[addressHash];
        for (uint256 i = 0; i < _doxxedAddressHashes.length; i++) {
            if (_doxxedAddressHashes[i] == addressHash) {
                // overwrite address hash with the last element before popping
                _doxxedAddressHashes[i] = _doxxedAddressHashes[
                    _doxxedAddressHashes.length - 1
                ];
                _doxxedAddressHashes.pop();
                break;
            }
        }
        emit DoxxedAddressHashRemoved(addressHash);
    }
}
