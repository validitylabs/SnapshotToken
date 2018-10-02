const sha3      = require('web3-utils').sha3;
const fs        = require('fs');
const assert    = require('assert');

// Valid hashes using Keccak-256

const contracts = {
    Crowdsale       : fs.readFileSync('node_modules/openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol'),
    ERC20Mintable   : fs.readFileSync('node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol'),
    ERC20Pausable   : fs.readFileSync('node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol'),
    Pausable        : fs.readFileSync('node_modules/openzeppelin-solidity/contracts/lifecycle/Pausable.sol'),
    Ownable         : fs.readFileSync('node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol'),
    ERC20           : fs.readFileSync('node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol'),
    IERC20          : fs.readFileSync('node_modules/openzeppelin-solidity/contracts/token/ERC20/IERC20.sol'),
    SafeMath        : fs.readFileSync('node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol'),
    TokenVesting    : fs.readFileSync('node_modules/openzeppelin-solidity/contracts/drafts/TokenVesting.sol')
};

const hashes = {
    Crowdsale     : '0x22328e5b28444f1badbc0ed1c4d4eee03337c1a6e325a35c076563f0914b11c9',
    ERC20Mintable : '0xd64cd619195bf02d33f882ef0828d68fc826063a0a0bbe83d1eca07db45e3267',
    ERC20Pausable : '0xe8cf3fe29ffe895a18c1909bac6cee524aca605c90e6933be464543a20e19cde',
    Pausable      : '0xafc1b9e88d6da87b1f0ca9fa2208244ccff38ee2b269459f3f5d35a8390e4402',
    Ownable       : '0x7b4604fd00f7c80ecd9e18f3f7d85a0bc64bd35eda3381a8c522685b88a5883f',
    ERC20         : '0x7c72349eba585c06cd29687a40223d1824ee82a17f3df23d65eeb75e5aade8b7',
    IERC20        : '0x0786a09def412e5a92e1da8545114b39f9bbd8bd1ba6f62a5bf8b81f54ab25bf',
    SafeMath      : '0xca27427124232a675642ba45303b78d5a36e1207ee222030ef249e11eba5a224',
    TokenVesting  : '0x30ceace9532b1f67e61b4a977cc9165c83ecef323f1ce21c6e34da37fa573326'
};

Object.keys(contracts).forEach((key) => {
    try {
        assert.equal(sha3(contracts[key]), hashes[key], 'Hash mismatch: ' + key);
    } catch (error) {
        console.log(error.message + ' - Zeppelin Framework');
        console.log(key + ': ' + sha3(contracts[key]));
    }
});
