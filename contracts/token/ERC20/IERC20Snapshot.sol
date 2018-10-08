/**
 * @title Interface ERC20 SnapshotToken (abstract contract)
 * @author Validity Labs AG <info@validitylabs.org>
 */

pragma solidity 0.4.24;  


/* solhint-disable no-empty-blocks */
contract IERC20Snapshot {   
    /**
    * @dev Queries the balance of `_owner` at a specific `_timestamp`
    * @param _owner The address from which the balance will be retrieved
    * @param _timestamp The timestamp when the balance is queried
    * @return The balance at `_timestamp`
    */
    function balanceOfAt(address _owner, uint _timestamp) public view returns (uint256) {}

    /**
    * @notice Total amount of tokens at a specific `_timestamp`.
    * @param _timestamp The timestamp when the totalSupply is queried
    * @return The total amount of tokens at `_timestamp`
    */
    function totalSupplyAt(uint _timestamp) public view returns(uint256) {}
}
