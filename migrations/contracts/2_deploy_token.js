/**
 * Migration - Snapshot Token Implementation
 */
const SnapshotToken = artifacts.require('./ASnapshotToken.sol');

module.exports = function (deployer) {
    deployer.deploy(SnapshotToken).then(() => {
        return SnapshotToken.deployed().then((tokenInstance) => {
            console.log('[ Snapshot Token Address: ]: ' + tokenInstance.address);
        });
    });
};
