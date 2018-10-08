/**
 * Test for Snapshot Token
 *
 * @author Validity Labs AG <info@validitylabs.org>
 */
import {expectThrow, getEvents, BigNumber} from './helpers/tools';
import {logger as log} from '../../tools/lib/logger';

const SnapshotToken = artifacts.require('./SnapshotTokenExample');

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

/**
 * Example Token contract
 */
contract('Snapshot Token', ([initialOwner, owner, recipient1, recipient2, recipient3, anotherAccount]) => {
    const totalSupply = new BigNumber(100);
    const amount = new BigNumber(10);
    const zeroAddress = '0x0000000000000000000000000000000000000000';

    // Provide a newly deployed snapshotTokenInstance for every test case
    let snapshotTokenInstance;
    before(async () => {
        snapshotTokenInstance = await SnapshotToken.new();
    });

    describe('when instantiated', () => {
        const name = 'ERC20Snapshot';
        const symbol = 'SST';
        const decimals = 18;

        it('has the right name', async () => {
            (await snapshotTokenInstance.name()).should.be.equal(name);
        });

        it('has the right symbol', async () => {
            (await snapshotTokenInstance.symbol()).should.be.equal(symbol);
        });

        it('has the right decimals', async () => {
            (await snapshotTokenInstance.decimals()).should.be.bignumber.equal(decimals);
        });

        it('is a minter', async () => {
            (await snapshotTokenInstance.isMinter(initialOwner)).should.be.equal(true);
        });
    });

    describe('add Minters', async () => {
        context('when called by a non-minter account', async () => {
            it('fails', async () => {
                await expectThrow(snapshotTokenInstance.addMinter(anotherAccount, {from: anotherAccount}));
            });
        });

        context('when called by a minter', async () => {
            it('adds another minter', async () => {
                (await snapshotTokenInstance.isMinter(owner)).should.be.equal(false);

                await snapshotTokenInstance.addMinter(owner, {from: initialOwner});

                (await snapshotTokenInstance.isMinter(owner)).should.be.equal(true);
            });
        });

        context('give up minter role', async () => {
            it('passes', async () => {
                await snapshotTokenInstance.renounceMinter({from: initialOwner});

                (await snapshotTokenInstance.isMinter(initialOwner)).should.be.equal(false);
            });
        });
    });

    describe('add Pausers', async () => {
        context('when called by a non-pauser account', async () => {
            it('fails', async () => {
                await expectThrow(snapshotTokenInstance.addPauser(anotherAccount, {from: anotherAccount}));
            });
        });

        context('when called by a pauser', async () => {
            it('adds another pauser', async () => {
                (await snapshotTokenInstance.isPauser(owner)).should.be.equal(false);

                await snapshotTokenInstance.addPauser(owner, {from: initialOwner});

                (await snapshotTokenInstance.isPauser(owner)).should.be.equal(true);
            });
        });

        context('give up pauser role', async () => {
            it('passes', async () => {
                await snapshotTokenInstance.renouncePauser({from: initialOwner});

                (await snapshotTokenInstance.isPauser(initialOwner)).should.be.equal(false);
            });
        });
    });

    describe('mint', async () => {
        context('when called by a non-minter account', async () => {
            it('fails', async () => {
                await expectThrow(snapshotTokenInstance.mint(owner, totalSupply, {from: anotherAccount}));
            });
        });

        context('when called by a minter account', async () => {
            let tx;
            let tx2;
            let timestamp;
            let timestamp2;

            before(async () => {
                (await snapshotTokenInstance.balanceOfAt(owner, web3.eth.getBlock(web3.eth.blockNumber).timestamp)).should.be.bignumber.equal(0);

                tx = await snapshotTokenInstance.mint(owner, (totalSupply.sub(amount)), {from: owner});
                timestamp = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
                log.info(timestamp);
                tx2 = await snapshotTokenInstance.mint(recipient1, amount, {from: owner});
                timestamp2 = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
                log.info(timestamp2);
            });

            it('mints requested amount', async () => {
                (await snapshotTokenInstance.totalSupply()).should.be.bignumber.equal(totalSupply);
                (await snapshotTokenInstance.totalSupplyAt(timestamp2)).should.be.bignumber.equal(totalSupply);
                (await snapshotTokenInstance.totalSupplyAt(timestamp)).should.be.bignumber.equal(totalSupply.sub(amount));
                (await snapshotTokenInstance.totalSupplyAt(timestamp - 1)).should.be.bignumber.equal(0);

                (await snapshotTokenInstance.balanceOf(owner)).should.be.bignumber.equal(totalSupply.sub(amount));
                (await snapshotTokenInstance.balanceOfAt(owner, timestamp)).should.be.bignumber.equal(totalSupply.sub(amount));
                (await snapshotTokenInstance.balanceOfAt(owner, timestamp - 1)).should.be.bignumber.equal(0);

                (await snapshotTokenInstance.balanceOf(recipient1)).should.be.bignumber.equal(amount);
                (await snapshotTokenInstance.balanceOfAt(recipient1, timestamp2)).should.be.bignumber.equal(amount);
                (await snapshotTokenInstance.balanceOfAt(recipient1, timestamp2 - 1)).should.be.bignumber.equal(0);
            });

            it('emits a transfer event', async () => {
                const mintEvents = getEvents(tx, 'Transfer');
                mintEvents[0].to.should.be.equal(owner);
                mintEvents[0].value.should.be.bignumber.equal(totalSupply.sub(amount));

                const mintEvents2 = getEvents(tx2, 'Transfer');
                mintEvents2[0].to.should.be.equal(recipient1);
                mintEvents2[0].value.should.be.bignumber.equal(amount);
            });

            it('emits a transfer event', async () => {
                const transferEvents = getEvents(tx, 'Transfer');
                transferEvents[0].from.should.be.equal(zeroAddress);
                transferEvents[0].to.should.be.equal(owner);
                transferEvents[0].value.should.be.bignumber.equal(totalSupply.sub(amount));

                const transferEvents2 = getEvents(tx2, 'Transfer');
                transferEvents2[0].from.should.be.equal(zeroAddress);
                transferEvents2[0].to.should.be.equal(recipient1);
                transferEvents2[0].value.should.be.bignumber.equal(amount);
            });
        });
    });

    describe('finishMinting', async () => {
        context('when token minting hasn\'t finished', async () => {
            it('finishes token minting', async () => {
                await snapshotTokenInstance.finishMinting({from: owner});

                (await snapshotTokenInstance.mintingFinished()).should.be.equal(true);
                await expectThrow(snapshotTokenInstance.mint(owner, totalSupply, {from: owner}));
            });
        });

        context('when token minting had already finished', async () => {
            it('fails', async () => {
                await expectThrow(snapshotTokenInstance.finishMinting({from: owner}));
            });
        });
    });

    describe('transfer', async () => {
        context('when paused', async () => {
            it('fails', async () => {
                await snapshotTokenInstance.pause({from: owner});

                await expectThrow(snapshotTokenInstance.transfer(recipient3, amount, {from: recipient1}));
                (await snapshotTokenInstance.balanceOf(recipient3)).should.be.bignumber.equal(0);
            });
        });

        context('when unpaused', async () => {
            before(async () => {
                await snapshotTokenInstance.unpause({from: owner});
            });

            context('when the sender hasn\'t enough balance', async () => {
                it('fails', async () => {
                    await expectThrow(snapshotTokenInstance.transfer(recipient3, amount, {from: anotherAccount}));
                    (await snapshotTokenInstance.balanceOf(recipient3)).should.be.bignumber.equal(0);
                });
            });

            context('when the sender has enough balance', async () => {
                context('when recipient is zero address', async () => {
                    it('fails', async () => {
                        await expectThrow(snapshotTokenInstance.transfer(zeroAddress, amount, {from: recipient1}));
                        (await snapshotTokenInstance.balanceOf(zeroAddress)).should.be.bignumber.equal(0);
                    });
                });

                context('when recipient is different to zero address and the token contract', async () => {
                    context('when amount is zero', async () => {
                        it('emits a transfer event', async () => {
                            const tx = await snapshotTokenInstance.transfer(recipient3, 0, {from: recipient1});
                            const transferEvents = getEvents(tx, 'Transfer');

                            transferEvents[0].from.should.be.equal(recipient1);
                            transferEvents[0].to.should.be.equal(recipient3);
                            transferEvents[0].value.should.be.bignumber.equal(0);
                        });
                    });

                    context('when amount is different to zero', async () => {
                        let tx;
                        let timestamp;
                        let amount;
                        before(async () => {
                            amount = await snapshotTokenInstance.balanceOf(recipient1);
                            tx = await snapshotTokenInstance.transfer(recipient3, amount, {from: recipient1});
                            timestamp = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
                        });

                        it('transfers requested amount', async () => {
                            (await snapshotTokenInstance.balanceOf(recipient1)).should.be.bignumber.equal(0);
                            (await snapshotTokenInstance.balanceOf(recipient3)).should.be.bignumber.equal(amount);

                            (await snapshotTokenInstance.balanceOfAt(recipient1, timestamp - 1)).should.be.bignumber.equal(amount);
                            (await snapshotTokenInstance.balanceOfAt(recipient3, timestamp - 1)).should.be.bignumber.equal(0);
                        });

                        it('emits a transfer event', async () => {
                            const transferEvents = getEvents(tx, 'Transfer');

                            transferEvents[0].from.should.be.equal(recipient1);
                            transferEvents[0].to.should.be.equal(recipient3);
                            transferEvents[0].value.should.be.bignumber.equal(amount);
                        });
                    });
                });
            });
        });
    });

    describe('approve', async () => {
        context('when paused', async () => {
            it('fails', async () => {
                await snapshotTokenInstance.pause({from: owner});

                await expectThrow(snapshotTokenInstance.approve(anotherAccount, amount, {from: recipient3}));
            });
        });

        context('when unpaused', async () => {
            before(async () => {
                await snapshotTokenInstance.unpause({from: owner});
            });
            context('when spender has no previous approved amount', async () => {
                let tx;
                before(async () => {
                    tx = await snapshotTokenInstance.approve(anotherAccount, 1, {from: recipient3});
                });

                it('approves the requested amount', async () => {
                    (await snapshotTokenInstance.allowance(recipient3, anotherAccount)).should.be.bignumber.equal(1);
                });

                it('emits an approval event', async () => {
                    const events = getEvents(tx);
                    events.Approval[0].owner.should.be.equal(recipient3);
                    events.Approval[0].spender.should.be.equal(anotherAccount);
                    events.Approval[0].value.should.be.bignumber.equal(1);
                });
            });

            context('when spender has an approved amount', async () => {
                context('when new amount is zero', async () => {
                    let tx;
                    before(async () => {
                        tx = await snapshotTokenInstance.approve(anotherAccount, 0, {from: recipient3});
                    });

                    it('replaces the approved amount with zero', async () => {
                        (await snapshotTokenInstance.allowance(recipient3, anotherAccount)).should.be.bignumber.equal(0);
                    });

                    it('emits an approval event', async () => {
                        const approvalEvents = getEvents(tx, 'Approval');
                        approvalEvents[0].owner.should.be.equal(recipient3);
                        approvalEvents[0].spender.should.be.equal(anotherAccount);
                        approvalEvents[0].value.should.be.bignumber.equal(0);
                    });
                });
            });
        });
    });

    describe('transferFrom', async () => {
        before(async () => {
            await snapshotTokenInstance.approve(anotherAccount, amount, {from: owner});
        });

        context('when paused', async () => {
            it('fails', async () => {
                await snapshotTokenInstance.pause({from: owner});

                await expectThrow(snapshotTokenInstance.transferFrom(owner, initialOwner, amount, {from: anotherAccount}));
            });
        });

        context('when unpaused', async () => {
            before(async () => {
                await snapshotTokenInstance.unpause({from: owner});
            });

            context('when spender hasn\'t enough approved balance', async () => {
                it('fails', async () => {
                    await expectThrow(snapshotTokenInstance.transferFrom(owner, initialOwner, amount + 1, {from: anotherAccount}));
                });
            });

            context('when spender has enough approved balance', async () => {
                let tx;
                let timestamp;
                before(async () => {
                    let balance = await snapshotTokenInstance.balanceOf(owner);
                    log.info(balance.toNumber());

                    balance = await snapshotTokenInstance.balanceOf(initialOwner);
                    log.info(balance.toNumber());

                    tx = await snapshotTokenInstance.transferFrom(owner, initialOwner, amount, {from: anotherAccount});
                    timestamp = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
                });

                it('transfers the requested amount', async () => {
                    (await snapshotTokenInstance.allowance(owner, anotherAccount)).should.be.bignumber.equal(0);

                    let balance = await snapshotTokenInstance.balanceOf(owner);
                    log.info(balance.toNumber());
                    balance = await snapshotTokenInstance.balanceOf(initialOwner);
                    log.info(balance.toNumber());
                    (await snapshotTokenInstance.balanceOf(owner)).should.be.bignumber.equal(totalSupply.sub(amount.mul(2)));
                    (await snapshotTokenInstance.balanceOf(initialOwner)).should.be.bignumber.equal(amount);

                    balance = await snapshotTokenInstance.balanceOfAt(owner, timestamp);
                    log.info(balance.toNumber());
                    balance = await snapshotTokenInstance.balanceOfAt(initialOwner, timestamp);
                    log.info(balance.toNumber());
                    (await snapshotTokenInstance.balanceOfAt(owner, timestamp + 1)).should.be.bignumber.equal(totalSupply.sub(amount.mul(2)));
                    (await snapshotTokenInstance.balanceOfAt(initialOwner, timestamp)).should.be.bignumber.equal(amount);

                    balance = await snapshotTokenInstance.balanceOfAt(owner, timestamp - 1);
                    log.info(balance.toNumber());
                    (await snapshotTokenInstance.balanceOfAt(owner, timestamp - 1)).should.be.bignumber.equal(totalSupply.sub(amount));
                    (await snapshotTokenInstance.balanceOfAt(initialOwner, timestamp - 1)).should.be.bignumber.equal(0);
                });

                it('emits a transfer event', async () => {
                    const transferEvents = getEvents(tx, 'Transfer');
                    transferEvents[0].from.should.be.equal(owner);
                    transferEvents[0].to.should.be.equal(initialOwner);
                    transferEvents[0].value.should.be.bignumber.equal(amount);
                });
            });
        });
    });

    describe('increaseAllowance', async () => {
        before(async () => {
            await snapshotTokenInstance.approve(anotherAccount, amount, {from: owner});
        });

        context('when paused', async () => {
            it('fails', async () => {
                await snapshotTokenInstance.pause({from: owner});

                await expectThrow(snapshotTokenInstance.increaseAllowance(anotherAccount, 1, {from: owner}));
            });
        });

        context('when unpaused', async () => {
            let tx;
            before(async () => {
                await snapshotTokenInstance.unpause({from: owner});
                tx = await snapshotTokenInstance.increaseAllowance(anotherAccount, 1, {from: owner});
            });

            it('increases allowance', async () => {
                (await snapshotTokenInstance.allowance(owner, anotherAccount)).should.be.bignumber.equal(amount.add(1));
            });

            it('emits an approval event', async () => {
                const approvalEvents = getEvents(tx, 'Approval');
                approvalEvents[0].owner.should.be.equal(owner);
                approvalEvents[0].spender.should.be.equal(anotherAccount);
                approvalEvents[0].value.should.be.bignumber.equal(amount.add(1));
            });
        });
    });

    describe('decreaseAllowance', async () => {
        context('when paused', async () => {
            it('fails', async () => {
                await snapshotTokenInstance.pause({from: owner});

                await expectThrow(snapshotTokenInstance.decreaseAllowance(anotherAccount, 1, {from: owner}));
            });
        });

        context('when unpaused', async () => {
            let tx;
            before(async () => {
                await snapshotTokenInstance.unpause({from: owner});
                tx = await snapshotTokenInstance.decreaseAllowance(anotherAccount, 1, {from: owner});
            });

            it('decreases allowance', async () => {
                (await snapshotTokenInstance.allowance(owner, anotherAccount)).should.be.bignumber.equal(amount);
            });

            it('emits an approval event', async () => {
                (await snapshotTokenInstance.allowance(owner, anotherAccount)).should.be.bignumber.equal(amount);

                const approvalEvents = getEvents(tx, 'Approval');
                approvalEvents[0].owner.should.be.equal(owner);
                approvalEvents[0].spender.should.be.equal(anotherAccount);
                approvalEvents[0].value.should.be.bignumber.equal(amount);
            });
        });
    });

    describe('burn', async () => {
        context('when the amount to burn is greater than the balance', async () => {
            it('fails', async () => {
                await expectThrow(snapshotTokenInstance.burn(totalSupply, {from: owner}));
            });
        });

        context('when the amount to burn is not greater than the balance', async () => {
            let tx;
            let timestamp;
            before(async () => {
                tx = await snapshotTokenInstance.burn(amount, {from: owner});
                timestamp = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
            });

            it('burns the requested amount', async () => {
                (await snapshotTokenInstance.totalSupply()).should.be.bignumber.equal(totalSupply.sub(amount));

                (await snapshotTokenInstance.totalSupplyAt(timestamp)).should.be.bignumber.equal(totalSupply.sub(amount));
                (await snapshotTokenInstance.totalSupplyAt(timestamp - 1)).should.be.bignumber.equal(totalSupply);

                (await snapshotTokenInstance.balanceOfAt(owner, timestamp)).should.be.bignumber.equal(70);
                (await snapshotTokenInstance.balanceOfAt(owner, timestamp - 1)).should.be.bignumber.equal(80);
            });

            it('emits a transfer event', async () => {
                const transferEvents = getEvents(tx, 'Transfer');
                transferEvents[0].from.should.be.equal(owner);
                transferEvents[0].to.should.be.equal(zeroAddress);
                transferEvents[0].value.should.be.bignumber.equal(amount);
            });
        });
    });

    describe('burnFrom', async () => {
        context('when the amount to burnFrom is greater than the balance', async () => {
            it('fails', async () => {
                await expectThrow(snapshotTokenInstance.burnFrom(owner, (amount.mul(2)), {from: anotherAccount}));
            });
        });

        context('when the amount to burnFrom is not greater than the balance', async () => {
            let tx;
            let timestamp;
            before(async () => {
                tx = await snapshotTokenInstance.burnFrom(owner, amount, {from: anotherAccount});
                timestamp = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
            });

            it('burnFrom the requested amount', async () => {
                (await snapshotTokenInstance.totalSupply()).should.be.bignumber.equal(totalSupply.sub(amount.mul(2)));

                (await snapshotTokenInstance.totalSupplyAt(timestamp)).should.be.bignumber.equal(totalSupply.sub(amount.mul(2)));
                (await snapshotTokenInstance.totalSupplyAt(timestamp - 1)).should.be.bignumber.equal(totalSupply.sub(amount));

                (await snapshotTokenInstance.balanceOfAt(owner, timestamp)).should.be.bignumber.equal(60);
                (await snapshotTokenInstance.balanceOfAt(owner, timestamp - 1)).should.be.bignumber.equal(70);
            });

            it('emits a transfer event', async () => {
                const transferEvents = getEvents(tx, 'Transfer');
                transferEvents[0].from.should.be.equal(owner);
                transferEvents[0].to.should.be.equal(zeroAddress);
                transferEvents[0].value.should.be.bignumber.equal(amount);
            });
        });
    });
});
