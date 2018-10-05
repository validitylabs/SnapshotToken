/**
 * @title Example Token
 * @author Validity Labs AG <info@validitylabs.org>
 */

pragma solidity 0.4.24;  

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "../token/ERC20/ERC20SnapshotToken.sol";

/* solhint-disable */
contract ASnapshotToken is ERC20SnapshotToken, ERC20Pausable, ERC20Burnable, ERC20Mintable {
    string public constant name = "Example Token";
    string public constant symbol = "ExT";
    uint8 public constant decimals = 18;
}
