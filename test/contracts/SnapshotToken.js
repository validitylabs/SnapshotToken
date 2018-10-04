/**
 * Test for Snapshot Token
 *
 * @author Validity Labs AG <info@validitylabs.org>
 */

import {expectThrow, getEvents, BigNumber} from './helpers/tools';
const expectEvent = require('./helpers/expectEvent');
require('truffle-test-utils').init();

const ExToken = artifacts.require('./ExToken');

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

    // Provide a newly deployed exTokenInstance for every test case
    let exTokenInstance;
    before(async () => {
        exTokenInstance = await ExToken.new();
    });

    describe('when instantiated', () => {
        const name = 'Example Token';
        const symbol = 'ExT';
        const decimals = 18;

        it('has the right name', async () => {
            (await exTokenInstance.name()).should.be.equal(name);
        });

        it('has the right symbol', async () => {
            (await exTokenInstance.symbol()).should.be.equal(symbol);
        });

        it('has the right decimals', async () => {
            (await exTokenInstance.decimals()).should.be.bignumber.equal(decimals);
        });

        it('is a minter', async () => {
            (await exTokenInstance.isMinter(initialOwner)).should.be.equal(true);
        });
    });

    describe('add Minters', async () => {
        context('when called by a non-minter account', async () => {
            it('fails', async () => {
                await expectThrow(exTokenInstance.addMinter(anotherAccount, {from: anotherAccount}));
            });
        });

        context('when called by a minter', async () => {
            it('adds another minter', async () => {
                (await exTokenInstance.isMinter(owner)).should.be.equal(false);

                await exTokenInstance.addMinter(owner, {from: initialOwner});

                (await exTokenInstance.isMinter(owner)).should.be.equal(true);
            });
        });

        context('give up minter role', async () => {
            it('passes', async () => {
                await exTokenInstance.renounceMinter({from: initialOwner});

                (await exTokenInstance.isMinter(initialOwner)).should.be.equal(false);
            });
        });
    });

    describe('add Pausers', async () => {
        context('when called by a non-pauser account', async () => {
            it('fails', async () => {
                await expectThrow(exTokenInstance.addPauser(anotherAccount, {from: anotherAccount}));
            });
        });

        context('when called by a pauser', async () => {
            it('adds another pauser', async () => {
                (await exTokenInstance.isPauser(owner)).should.be.equal(false);

                await exTokenInstance.addPauser(owner, {from: initialOwner});

                (await exTokenInstance.isPauser(owner)).should.be.equal(true);
            });
        });

        context('give up pauser role', async () => {
            it('passes', async () => {
                await exTokenInstance.renouncePauser({from: initialOwner});

                (await exTokenInstance.isPauser(initialOwner)).should.be.equal(false);
            });
        });
    });

    describe('mint', async () => {
        context('when called by a non-minter account', async () => {
            it('fails', async () => {
                await expectThrow(exTokenInstance.mint(owner, totalSupply, {from: anotherAccount}));
            });
        });

        context('when called by a minter account', async () => {
            let tx;
            let tx2;
            let blockNum;
            let blockNum2;

            before(async () => {
                tx = await exTokenInstance.mint(owner, (totalSupply.sub(amount)), {from: owner});
                blockNum = web3.eth.blockNumber;
                tx2 = await exTokenInstance.mint(recipient1, amount, {from: owner});
                blockNum2 = web3.eth.blockNumber;
            });

            it('mints requested amount', async () => {
                (await exTokenInstance.totalSupply()).should.be.bignumber.equal(totalSupply);
                (await exTokenInstance.totalSupplyAt(blockNum2)).should.be.bignumber.equal(totalSupply);
                (await exTokenInstance.totalSupplyAt(blockNum)).should.be.bignumber.equal(totalSupply.sub(amount));
                (await exTokenInstance.totalSupplyAt(blockNum - 1)).should.be.bignumber.equal(0);

                (await exTokenInstance.balanceOf(owner)).should.be.bignumber.equal(totalSupply.sub(amount));
                (await exTokenInstance.balanceOfAt(owner, blockNum)).should.be.bignumber.equal(totalSupply.sub(amount));
                (await exTokenInstance.balanceOfAt(owner, blockNum - 1)).should.be.bignumber.equal(0);

                (await exTokenInstance.balanceOf(recipient1)).should.be.bignumber.equal(amount);
                (await exTokenInstance.balanceOfAt(recipient1, blockNum2)).should.be.bignumber.equal(amount);
                (await exTokenInstance.balanceOfAt(recipient1, blockNum2 - 1)).should.be.bignumber.equal(0);
            });

            it.skip('emits a mint event', async () => {
                // expectEvent.inLogs(tx, 'Mint', {
                //     from: zeroAddress,
                //     to: owner,
                //     value: amount
                // });

                assert.web3Event(tx, {
                    event: 'Mint',
                    args: {
                        from: 'zeroAddress',
                        to: owner,
                        value: amount
                    }
                }, 'The event is emitted');

                // const mintEvents = getEvents(tx, 'Mint');
                // mintEvents[0].to.should.be.equal(owner);
                // mintEvents[0].amount.should.be.bignumber.equal(totalSupply.sub(amount));

                // const mintEvents2 = getEvents(tx2, 'Mint');
                // mintEvents2[0].to.should.be.equal(recipient1);
                // mintEvents2[0].amount.should.be.bignumber.equal(amount);
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
                await exTokenInstance.finishMinting({from: owner});

                (await exTokenInstance.mintingFinished()).should.be.equal(true);
                await expectThrow(exTokenInstance.mint(owner, totalSupply, {from: owner}));
            });
        });

        context('when token minting had already finished', async () => {
            it('fails', async () => {
                await expectThrow(exTokenInstance.finishMinting({from: owner}));
            });
        });
    });

    describe('transfer', async () => {
        context('when paused', async () => {
            it('fails', async () => {
                await exTokenInstance.pause({from: owner});

                await expectThrow(exTokenInstance.transfer(recipient3, amount, {from: recipient1}));
                (await exTokenInstance.balanceOf(recipient3)).should.be.bignumber.equal(0);
            });
        });

        context('when unpaused', async () => {
            before(async () => {
                await exTokenInstance.unpause({from: owner});
            });

            context('when the sender hasn\'t enough balance', async () => {
                it('fails', async () => {
                    await expectThrow(exTokenInstance.transfer(recipient3, amount, {from: anotherAccount}));
                    (await exTokenInstance.balanceOf(recipient3)).should.be.bignumber.equal(0);
                });
            });

            context('when the sender has enough balance', async () => {
                context('when recipient is zero address', async () => {
                    it('fails', async () => {
                        await expectThrow(exTokenInstance.transfer(zeroAddress, amount, {from: recipient1}));
                        (await exTokenInstance.balanceOf(zeroAddress)).should.be.bignumber.equal(0);
                    });
                });

                context('when recipient is the token contract', async () => {
                    it.skip('fails', async () => {
                        await expectThrow(exTokenInstance.transfer(exTokenInstance.address, amount, {from: recipient1}));
                        (await exTokenInstance.balanceOf(exTokenInstance.address)).should.be.bignumber.equal(0);
                    });
                });

                context('when recipient is different to zero address and the token contract', async () => {
                    context('when amount is zero', async () => {
                        it('emits a transfer event', async () => {
                            const tx = await exTokenInstance.transfer(recipient3, 0, {from: recipient1});
                            const transferEvents = getEvents(tx, 'Transfer');

                            transferEvents[0].from.should.be.equal(recipient1);
                            transferEvents[0].to.should.be.equal(recipient3);
                            transferEvents[0].value.should.be.bignumber.equal(0);
                        });
                    });

                    context('when amount is different to zero', async () => {
                        let tx;
                        let blockNum;
                        before(async () => {
                            tx = await exTokenInstance.transfer(recipient3, amount, {from: recipient1});
                            blockNum = web3.eth.blockNumber;
                        });

                        it('transfers requested amount', async () => {
                            (await exTokenInstance.balanceOfAt(recipient1, blockNum)).should.be.bignumber.equal(0);
                            (await exTokenInstance.balanceOfAt(recipient3, blockNum)).should.be.bignumber.equal(amount);

                            (await exTokenInstance.balanceOfAt(recipient1, blockNum - 1)).should.be.bignumber.equal(amount);
                            (await exTokenInstance.balanceOfAt(recipient3, blockNum - 1)).should.be.bignumber.equal(0);
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
                await exTokenInstance.pause({from: owner});

                await expectThrow(exTokenInstance.approve(anotherAccount, amount, {from: recipient3}));
            });
        });

        context('when unpaused', async () => {
            before(async () => {
                await exTokenInstance.unpause({from: owner});
            });
            context('when spender has no previous approved amount', async () => {
                let tx;
                before(async () => {
                    tx = await exTokenInstance.approve(anotherAccount, 1, {from: recipient3});
                });

                it('approves the requested amount', async () => {
                    (await exTokenInstance.allowance(recipient3, anotherAccount)).should.be.bignumber.equal(1);
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
                        tx = await exTokenInstance.approve(anotherAccount, 0, {from: recipient3});
                    });

                    it('replaces the approved amount with zero', async () => {
                        (await exTokenInstance.allowance(recipient3, anotherAccount)).should.be.bignumber.equal(0);
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
            await exTokenInstance.approve(anotherAccount, amount, {from: owner});
        });

        context('when paused', async () => {
            it('fails', async () => {
                await exTokenInstance.pause({from: owner});

                await expectThrow(exTokenInstance.transferFrom(owner, initialOwner, amount, {from: anotherAccount}));
            });
        });

        context('when unpaused', async () => {
            before(async () => {
                await exTokenInstance.unpause({from: owner});
            });

            context('when spender hasn\'t enough approved balance', async () => {
                it('fails', async () => {
                    await expectThrow(exTokenInstance.transferFrom(owner, initialOwner, amount + 1, {from: anotherAccount}));
                });
            });

            context('when spender has enough approved balance', async () => {
                let tx;
                let blockNum;
                before(async () => {
                    tx = await exTokenInstance.transferFrom(owner, initialOwner, amount, {from: anotherAccount});
                    blockNum = web3.eth.blockNumber;
                });

                it('transfers the requested amount', async () => {
                    (await exTokenInstance.allowance(owner, anotherAccount)).should.be.bignumber.equal(0);

                    (await exTokenInstance.balanceOfAt(owner, blockNum)).should.be.bignumber.equal(totalSupply.sub(amount.mul(2)));
                    (await exTokenInstance.balanceOfAt(initialOwner, blockNum)).should.be.bignumber.equal(amount);

                    (await exTokenInstance.balanceOfAt(owner, blockNum - 1)).should.be.bignumber.equal(totalSupply.sub(amount));
                    (await exTokenInstance.balanceOfAt(initialOwner, blockNum - 1)).should.be.bignumber.equal(0);
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
            await exTokenInstance.approve(anotherAccount, amount, {from: owner});
        });

        context('when paused', async () => {
            it('fails', async () => {
                await exTokenInstance.pause({from: owner});

                await expectThrow(exTokenInstance.increaseAllowance(anotherAccount, 1, {from: owner}));
            });
        });

        context('when unpaused', async () => {
            let tx;
            before(async () => {
                await exTokenInstance.unpause({from: owner});
                tx = await exTokenInstance.increaseAllowance(anotherAccount, 1, {from: owner});
            });

            it('increases allowance', async () => {
                (await exTokenInstance.allowance(owner, anotherAccount)).should.be.bignumber.equal(amount.add(1));
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
                await exTokenInstance.pause({from: owner});

                await expectThrow(exTokenInstance.decreaseAllowance(anotherAccount, 1, {from: owner}));
            });
        });

        context('when unpaused', async () => {
            let tx;
            before(async () => {
                await exTokenInstance.unpause({from: owner});
                tx = await exTokenInstance.decreaseAllowance(anotherAccount, 1, {from: owner});
            });

            it('decreases allowance', async () => {
                (await exTokenInstance.allowance(owner, anotherAccount)).should.be.bignumber.equal(amount);
            });

            it('emits an approval event', async () => {
                (await exTokenInstance.allowance(owner, anotherAccount)).should.be.bignumber.equal(amount);

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
                await expectThrow(exTokenInstance.burn(totalSupply, {from: owner}));
            });
        });

        context('when the amount to burn is not greater than the balance', async () => {
            let amount;
            let tx;
            let blockNum;
            before(async () => {
                amount = await exTokenInstance.balanceOf(owner);
                tx = await exTokenInstance.burn(amount, {from: owner});
                blockNum = web3.eth.blockNumber;
            });

            it('burns the requested amount', async () => {
                (await exTokenInstance.totalSupplyAt(blockNum)).should.be.bignumber.equal(totalSupply.sub(amount));
                (await exTokenInstance.totalSupplyAt(blockNum - 1)).should.be.bignumber.equal(totalSupply);

                (await exTokenInstance.balanceOfAt(owner, blockNum)).should.be.bignumber.equal(0);
                (await exTokenInstance.balanceOfAt(owner, blockNum - 1)).should.be.bignumber.equal(amount);
            });

            it('emits a burn event', async () => {
                const burnEvents = getEvents(tx, 'Burn');
                burnEvents[0].burner.should.be.equal(owner);
                burnEvents[0].value.should.be.bignumber.equal(amount);
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
