/**
 * @title Mintable ERC20 SnapshotToken
 * @author Validity Labs AG <info@validitylabs.org>
 */

pragma solidity 0.4.24;  

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "./ERC20SnapshotToken.sol";


contract MintableERC20SnapshotToken is ERC20Mintable, ERC20SnapshotToken {   
    using SafeMath for uint256;

    /**
    * @notice Generates `_value` tokens that are assigned to `_owner`
    * @param _to The address that will be assigned the new tokens
    * @param _value The quantity of tokens generated
    * @return True if the tokens are generated correctly
    */
    function mint(address _to, uint256 _value) public returns (bool result) {
        result = super.mint(_to, _value);
        snapshotMint(_to);
    }
}
