/**
 * @title ERC20 Snapshot Token
 * inspired by Jordi Baylina's MiniMeToken to record historical balances
 * @version 1.0
 * @author Validity Labs AG <info@validitylabs.org>
 */

pragma solidity 0.4.24;  

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./IERC20SnapshotToken.sol";


contract ERC20SnapshotToken is ERC20, IERC20SnapshotToken {   
    using SafeMath for uint256;

    /**
    * @dev `Snapshot` is the structure that attaches a block number to a
    * given value. The block number attached is the one that last changed the value
    */
    struct Snapshot {
        uint128 fromBlock;  // `fromBlock` is the block number at which the value was generated from
        uint128 value;  // `value` is the amount of tokens at a specific block number
    }

    /**
    * @dev `_snapshotBalances` is the map that tracks the balance of each address, in this
    * contract when the balance changes the block number that the change
    * occurred is also included in the map
    */
    mapping (address => Snapshot[]) private _snapshotBalances;

    // Tracks the history of the `totalSupply` of the token
    Snapshot[] private _snapshotTotalSupply;

    /*** EVENTS ***/
    event SnapshotCreated(address indexed from, address indexed to, uint256 amount);

    /*** FUNCTIONS ***/
    /**
    * @dev Send `_value` tokens to `_to` from `msg.sender`
    * @param _to The address of the recipient
    * @param _value The amount of tokens to be transferred
    * @return Whether the transfer was successful or not
    */
    function transfer(address _to, uint256 _value) public returns (bool) {
        createSnapshot(msg.sender, _to, _value);
        return super.transfer(_to, _value);
    }

    /**
    * @dev Send `_value` tokens to `_to` from `_from` on the condition it is approved by `_from`
    * @param _from The address holding the tokens being transferred
    * @param _to The address of the recipient
    * @param _value The amount of tokens to be transferred
    * @return True if the transfer was successful
    */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        createSnapshot(msg.sender, _to, _value);
        return super.transferFrom(_from, _to, _value);
    }

    /**
    * @dev Queries the balance of `_owner` at a specific `_blockNumber`
    * @param _owner The address from which the balance will be retrieved
    * @param _blockNumber The block number when the balance is queried
    * @return The balance at `_blockNumber`
    */
    function balanceOfAt(address _owner, uint _blockNumber) public view returns (uint256) {
        return getValueAt(_snapshotBalances[_owner], _blockNumber);
    }

    /**
    * @notice Total amount of tokens at a specific `_blockNumber`.
    * @param _blockNumber The block number when the totalSupply is queried
    * @return The total amount of tokens at `_blockNumber`
    */
    function totalSupplyAt(uint _blockNumber) public view returns(uint256) {
        return getValueAt(_snapshotTotalSupply, _blockNumber);
    }

    /*** Internal functions ***/
    /**
    * @dev This is the actual transfer function in the token contract, it can
    *  only be called by other functions in this contract.
    * @param _from The address holding the tokens being transferred
    * @param _to The address of the recipient
    * @param _value The amount of tokens to be transferred
    * @return True if the transfer was successful
    */
    function createSnapshot(address _from, address _to, uint _value) internal {
        // First update the balance array with the new value for the address sending the tokens
        uint256 previousBalanceFrom = balanceOf(_from);
        updateValueAtNow(_snapshotBalances[_from], previousBalanceFrom.sub(_value));

        // Then update the balance array with the new value for the address receiving the tokens
        uint256 previousBalanceTo = balanceOf(_to);
        updateValueAtNow(_snapshotBalances[_to], previousBalanceTo.add(_value));

        // An event to make the transfer easy to find on the blockchain
        emit SnapshotCreated(_from, _to, _value);
    }

    /**
    * @dev `getValueAt` retrieves the number of tokens at a given block number
    * @param checkpoints The history of values being queried
    * @param _block The block number to retrieve the value at
    * @return The number of tokens being queried
    */
    function getValueAt(Snapshot[] storage checkpoints, uint _block) internal view returns (uint) {
        if (checkpoints.length == 0) return 0;

        // Shortcut for the actual value
        if (_block >= checkpoints[checkpoints.length.sub(1)].fromBlock) {
            return checkpoints[checkpoints.length.sub(1)].value;
        }

        if (_block < checkpoints[0].fromBlock) {
            return 0;
        } 

        // Binary search of the value in the array
        uint min;
        uint max = checkpoints.length.sub(1);

        while (max > min) {
            uint mid = (max.add(min).add(1)).div(2);
            if (checkpoints[mid].fromBlock <= _block) {
                min = mid;
            } else {
                max = mid.sub(1);
            }
        }

        return checkpoints[min].value;
    }

    /**
    * @dev `updateValueAtNow` used to update the `_snapshotBalances` map and the `_snapshotTotalSupply`
    * @param checkpoints The history of data being updated
    * @param _value The new number of tokens
    */
    function updateValueAtNow(Snapshot[] storage checkpoints, uint _value) internal {
        if ((checkpoints.length == 0) || (checkpoints[checkpoints.length.sub(1)].fromBlock < block.number)) {
            checkpoints.push(Snapshot(uint128(block.number), uint128(_value)));
        } else {
            checkpoints[checkpoints.length.sub(1)].value = uint128(_value);
        }
    }

    /**
    * @notice burns `_value` tokens that are assigned to `_account`
    * @param _value The quantity of tokens burned
    */
    function snapshotBurn(address _account, uint256 _value) internal {
        uint256 previousBalanceFrom = balanceOf(_account);
        uint256 newBalance = previousBalanceFrom.sub(_value);
   
        updateValueAtNow(_snapshotTotalSupply, totalSupply().sub(_value));
        updateValueAtNow(_snapshotBalances[_account], newBalance);
        emit SnapshotCreated(_account, 0x0, newBalance);
    }
    
    /**
    * @notice Generates `_value` tokens that are assigned to `_to`
    * @param _to The address that will be assigned the new tokens
    * @param _value The quantity of tokens generated
    */
    function snapshotMint(address _to, uint256 _value) internal {
        updateValueAtNow(_snapshotTotalSupply, totalSupply().add(_value));
        updateValueAtNow(_snapshotBalances[_to], balanceOf(_to).add(_value));
        emit SnapshotCreated(0x0, _to, _value);
    }
}
