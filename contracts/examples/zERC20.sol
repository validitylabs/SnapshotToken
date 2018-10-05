/**
 * @title plain erc20 token
 */

pragma solidity 0.4.24;  

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";


/* solhint-disable */
contract SnapshotToken is ERC20Pausable, ERC20Burnable, ERC20Mintable {
    string public constant name = "ERC 20";
    string public constant symbol = "ERC20";
    uint8 public constant decimals = 18;
}
