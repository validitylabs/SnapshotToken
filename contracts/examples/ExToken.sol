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
import "../token/ERC20/SnapshotToken.sol";


contract ExToken is ERC20, ERC20Pausable, ERC20Burnable, ERC20Mintable, SnapshotToken {
    /* solhint-disable */
    string public constant name = "Example Token";
    string public constant symbol = "ExT";
    uint8 public constant decimals = 18;
}
