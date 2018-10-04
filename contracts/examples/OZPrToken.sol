/**
 * @title Open Zeppelin's Pending PR Snapshot Token 
 */

pragma solidity 0.4.24;  

import "../oz/ERC20Snapshot.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";

/* solhint-disable */
contract OzPrToken is ERC20Snapshot, ERC20Pausable, ERC20Burnable, ERC20Mintable {
    string public constant name = "OZ PR TOKEN";
    string public constant symbol = "OZPR";
    uint8 public constant decimals = 18;
}
