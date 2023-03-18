// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.19;

// External Dependencies
import "@account-abstraction/contracts/core/BaseAccount.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Local Dependencies
import "../interfaces/IPrivateAccount.sol";

contract PrivateAccount is BaseAccount, IPrivateAccount, Ownable {
    using ECDSA for bytes32;

    /*//////////////////////////////////////////////////////////////
                            STORAGE VARIABLES
    //////////////////////////////////////////////////////////////*/

    uint96 private _nonce;
    IEntryPoint private immutable _entryPoint;
    bool private _initialized;

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

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    /*//////////////////////////////////////////////////////////////
                            EXTERNALS
    //////////////////////////////////////////////////////////////*/

    /**
     *  execute one or multuple transactions
     *  @param dest array of destination contract addresses
     *  @param func array of abi encoded functions with calldata
     */
    function execute(address[] calldata dest, bytes[] calldata func) external {
        _requireFromEntryPointOrOwner();
        require(dest.length == func.length, "wrong array lengths");
        for (uint256 i = 0; i < dest.length; i++) {
            (bool success, bytes memory result) = dest[i].call{value: 0}(
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

    /*//////////////////////////////////////////////////////////////
                            INTERNALS
    //////////////////////////////////////////////////////////////*/

    function _initialize(address owner) internal virtual {
        require(!_initialized, "Contract has been initialized already");
        _initialized = true;
        _transferOwnership(owner);
        emit PrivateAccountInitialized(_entryPoint, owner);
    }

    /// Require the function call went through EntryPoint or owner
    function _requireFromEntryPointOrOwner() internal view {
        require(
            msg.sender == address(entryPoint()) || msg.sender == owner(),
            "account: not Owner or EntryPoint"
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
}
