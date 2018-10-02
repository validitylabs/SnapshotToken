/**
 * @title Interface SnapshotToken (abstract contract)
 * @version 1.0
 * @author Validity Labs AG <info@validitylabs.org>
 */

pragma solidity 0.4.24;  


/* solhint-disable no-empty-blocks */
contract ISnapshotToken {   
    /**
    * @dev Queries the balance of `_owner` at a specific `_blockNumber`
    * @param _owner The address from which the balance will be retrieved
    * @param _blockNumber The block number when the balance is queried
    * @return The balance at `_blockNumber`
    */
    function balanceOfAt(address _owner, uint _blockNumber) public view returns (uint256) {}

    /**
    * @notice Total amount of tokens at a specific `_blockNumber`.
    * @param _blockNumber The block number when the totalSupply is queried
    * @return The total amount of tokens at `_blockNumber`
    */
    function totalSupplyAt(uint _blockNumber) public view returns(uint256) {}
}
