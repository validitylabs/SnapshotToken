/**
 * Migration - Snapshot Token Implementation
 */
const SnapshotToken = artifacts.require('./SnapshotTokenExample.sol');

module.exports = function (deployer) {
    deployer.deploy(SnapshotToken).then(() => {
        return SnapshotToken.deployed().then((tokenInstance) => {
            console.log('[ Snapshot Token Address: ]: ' + tokenInstance.address);
        });
    });
};
