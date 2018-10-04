/**
 * @title Burnable ERC20 Snapshot Token
 * @author Validity Labs AG <info@validitylabs.org>
 */

pragma solidity 0.4.24;  

import "./ERC20SnapshotToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";


contract BurnableERC20SnapshotToken is ERC20Burnable, ERC20SnapshotToken {   
    using SafeMath for uint256;

    /**
    * @dev called to burn _value of tokens from the msg.sender
    * @param _value uint256 the amount of tokens to burn
    */
    function burn(uint256 _value) public {
        super.burn(_value);
        snapshotBurn(msg.sender);
    }

    /**
    * @dev called to burn _value of tokens of the allowance allowed from msg.sender
    * @param _value uint256 the amount of tokens to burn
    */
    function burnFrom(address _account, uint256 _value) public {
        super.burnFrom(_account, _value);
        snapshotBurn(_account);
    }
}
