/**
 * @title Example Token
 * @version 1.0
 * @author Validity Labs AG <info@validitylabs.org>
 */

pragma solidity 0.4.24;  

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "../token/ERC20/ERC20SnapshotToken.sol";
import "../token/ERC20/BurnableERC20SnapshotToken.sol";
import "../token/ERC20/MintableERC20SnapshotToken.sol";

/* solhint-disable */
contract ExToken is ERC20, ERC20Pausable, ERC20Burnable, ERC20Mintable, ERC20SnapshotToken, MintableERC20SnapshotToken, BurnableERC20SnapshotToken {
    string public constant name = "Example Token";
    string public constant symbol = "ExT";
    uint8 public constant decimals = 18;
}
