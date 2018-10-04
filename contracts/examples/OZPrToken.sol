/**
 * @title Example Token
 * @author Validity Labs AG <info@validitylabs.org>
 */

pragma solidity 0.4.24;  

import "../0zPr/ERC20Snapshot.sol";

/* solhint-disable */
contract OzPrToken is ERC20Snapshot {
    string public constant name = "OZ PR TOKEN";
    string public constant symbol = "OZPR";
    uint8 public constant decimals = 18;
}
