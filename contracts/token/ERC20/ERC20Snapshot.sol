/**
 * @title ERC20 Snapshot Token
 * inspired by Jordi Baylina's MiniMeToken to record historical balances
 * @author Validity Labs AG <info@validitylabs.org>
 */

pragma solidity 0.4.24;  

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./IERC20Snapshot.sol";


/* solhint-disable not-rely-on-time*/
contract ERC20Snapshot is ERC20, IERC20Snapshot {   
    using SafeMath for uint256;

    /**
    * @dev `Snapshot` is the structure that relates a block.timestamp to a value. 
    */
    struct Snapshot {
        uint128 timestamp;  // `timestamp` is the block.timestamp at which the value was generated from
        uint128 value;  // `value` is the amount of tokens at a specific timestamp
    }

    /**
    * @dev `_snapshotBalances` is the map that tracks the balance of each address, in this
    * contract when the balance changes the block.timestamp that the change
    * occurred is also included in the map
    */
    mapping (address => Snapshot[]) private _snapshotBalances;

    // Tracks the history of the `totalSupply` of the token
    Snapshot[] private _snapshotTotalSupply;

    /*** FUNCTIONS ***/
    /** OVERRIDE
    * @dev Send `_value` tokens to `_to` from `msg.sender`
    * @param _to The address of the recipient
    * @param _value The amount of tokens to be transferred
    * @return Whether the transfer was successful or not
    */
    function transfer(address _to, uint256 _value) public returns (bool result) {
        result = super.transfer(_to, _value);
        createSnapshot(msg.sender, _to);
    }

    /** OVERRIDE
    * @dev Send `_value` tokens to `_to` from `_from` on the condition it is approved by `_from`
    * @param _from The address holding the tokens being transferred
    * @param _to The address of the recipient
    * @param _value The amount of tokens to be transferred
    * @return True if the transfer was successful
    */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool result) {
        result = super.transferFrom(_from, _to, _value);
        createSnapshot(_from, _to);
    }

    /**
    * @dev Queries the balance of `_owner` at a specific `_timestamp`
    * @param _owner The address from which the balance will be retrieved
    * @param _timestamp The block.timestamp when the balance is queried
    * @return The balance at `_timestamp`
    */
    function balanceOfAt(address _owner, uint _timestamp) public view returns (uint256) {
        return getValueAt(_snapshotBalances[_owner], _timestamp);
    }

    /**
    * @dev Total amount of tokens at a specific `_timestamp`.
    * @param _timestamp The block.timestamp when the totalSupply is queried
    * @return The total amount of tokens at `_timestamp`
    */
    function totalSupplyAt(uint _timestamp) public view returns(uint256) {
        return getValueAt(_snapshotTotalSupply, _timestamp);
    }

    /*** Internal functions ***/
    /**
    * @dev Updates snapshot mappings for _from and _to and emit an event
    * @param _from The address holding the tokens being transferred
    * @param _to The address of the recipient
    * @return True if the transfer was successful
    */
    function createSnapshot(address _from, address _to) internal {
        updateValueAtNow(_snapshotBalances[_from], balanceOf(_from));
        updateValueAtNow(_snapshotBalances[_to], balanceOf(_to));
    }

    /**
    * @dev `getValueAt` retrieves the number of tokens at a given block.timestamp
    * @param checkpoints The history of values being queried
    * @param _timestamp The block.timestamp to retrieve the value at
    * @return The number of tokens being queried
    */
    function getValueAt(Snapshot[] storage checkpoints, uint _timestamp) internal view returns (uint) {
        if (checkpoints.length == 0) return 0;

        // Shortcut for the actual value
        if (_timestamp >= checkpoints[checkpoints.length.sub(1)].timestamp) {
            return checkpoints[checkpoints.length.sub(1)].value;
        }

        if (_timestamp < checkpoints[0].timestamp) {
            return 0;
        } 

        // Binary search of the value in the array
        uint min;
        uint max = checkpoints.length.sub(1);

        while (max > min) {
            uint mid = (max.add(min).add(1)).div(2);
            if (checkpoints[mid].timestamp <= _timestamp) {
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
        if ((checkpoints.length == 0) || (checkpoints[checkpoints.length.sub(1)].timestamp < now)) {
            checkpoints.push(Snapshot(uint128(now), uint128(_value)));
        } else {
            checkpoints[checkpoints.length.sub(1)].value = uint128(_value);
        }
    }

    /** OVERRIDE
    * @dev Internal function that mints an amount of the token and assigns it to
    * an account. This encapsulates the modification of balances such that the
    * proper events are emitted.
    * @param account The account that will receive the created tokens.
    * @param amount The amount that will be created.
    */
    function _mint(address account, uint256 amount) internal {
        super._mint(account, amount);
        updateValueAtNow(_snapshotTotalSupply, totalSupply());
        updateValueAtNow(_snapshotBalances[account], balanceOf(account));
    }

    /** OVERRIDE
    * @dev Internal function that burns an amount of the token of a given
    * account.
    * @param account The account whose tokens will be burnt.
    * @param amount The amount that will be burnt.
    */
    function _burn(address account, uint256 amount) internal {
        super._burn(account, amount);
        updateValueAtNow(_snapshotTotalSupply, totalSupply());
        updateValueAtNow(_snapshotBalances[account], balanceOf(account));
    }

    /** OVERRIDE
    * @dev Internal function that burns an amount of the token of a given
    * account, deducting from the sender's allowance for said account. Uses the
    * internal burn function.
    * @param account The account whose tokens will be burnt.
    * @param amount The amount that will be burnt.
    */
    function _burnFrom(address account, uint256 amount) internal {
        super._burnFrom(account, amount);
        updateValueAtNow(_snapshotTotalSupply, totalSupply());
        updateValueAtNow(_snapshotBalances[account], balanceOf(account));
    }
}
