/**
 * @title Struct Snapshot Token
 * @author Validity Labs AG <info@validitylabs.org>
 */

pragma solidity 0.4.24;  

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "../token/ERC20/ERC20Snapshot.sol";

/* solhint-disable */
contract SnapshotTokenExample is ERC20Snapshot, ERC20Pausable, ERC20Burnable, ERC20Mintable {
    string public constant name = "ERC20Snapshot";
    string public constant symbol = "SST";
    uint8 public constant decimals = 18;
}
