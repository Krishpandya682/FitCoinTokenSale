var FitCoinToken = artifacts.require("./FitCoinToken.sol")

contract ('FitCoinToken', function (accounts) {
    
    it('initializes the contract with correct values', function () {
        return FitCoinToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function (name) {
            assert.equal(name, 'FitCoin Token', 'Has the correct name');
            return tokenInstance.symbol(); 
        }).then(function (symbol) { 
            assert.equal(symbol, "FTC", "has correct symbol");
          return tokenInstance.standard(); 
        }).then(function (standard) { 
            assert.equal(standard, "FitCoin Token v1.0", "has correct standard");
        });        
    })

    it('sets the total supply of tokens upon deployment', function () {
        return FitCoinToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function (totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1000000');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function (adminBalance) {
            assert.equal(adminBalance.toNumber(), 1000000, 'allocates initial supply to admin')
        })
    });


    it('Transfers ownership of tokens', function () {
        return FitCoinToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1], 9999999999999999999999);
        }).then(assert.fail).catch(function (error) {
            assert(error.message, 'error message must contain revert');
            
            return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
        }).then(function (success) { 
            assert.equal(success, true, 'it returns true');
            return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
        }).then(function (reciept) { 
            assert.equal(reciept.logs.length, 1, 'triggers one event');
            assert.equal(reciept.logs[0].event, 'Transfer', 'triggers a "Transfer" event');
            assert.equal(reciept.logs[0].args._from, accounts[0], 'correct from address');
            assert.equal(reciept.logs[0].args._to, accounts[1], 'correct to address');
            assert.equal(reciept.logs[0].args._value, 250000, 'correct value');

            return tokenInstance.balanceOf(accounts[1]);
        }).then(function (balance) { 
            assert.equal(balance.toNumber(), 250000, 'it adds the amount to the reciever account');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function (balance) { 
            assert.equal(balance.toNumber(), 750000, 'it reduces the balance of sender account');
        })
        });



    it('approves tokens for delegated transfers', function () {
        return FitCoinToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function (success) {
            assert.equal(success, true, 'it returns true');
            return tokenInstance.approve(accounts[1], 100, {from: accounts[0]});
        }).then(function (reciept) {
            assert.equal(reciept.logs.length, 1, 'triggers one event');
            assert.equal(reciept.logs[0].event, 'Approval', 'triggers a "Approval" event');
            assert.equal(reciept.logs[0].args._owner, accounts[0], 'correct owner address');
            assert.equal(reciept.logs[0].args._spender, accounts[1], 'correct spender address');
            assert.equal(reciept.logs[0].args._value, 100, 'correct value');
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function (allowance) {
            assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
        });
    });
    
    it('transfers from another approved account', function () {
        return FitCoinToken.deployed().then(function (instance) {
            tokenInstance = instance;
            fromAcc = accounts[2];
            toAcc = accounts[3];
            spendingAcc = accounts[4];
            //Initially send tokens to the from Account to be able to spend
            return tokenInstance.transfer(fromAcc, 100, { from: accounts[0] });
        }).then(function (reciept) {
            // Approve spendingAcc to spend 10 tokens from the from acc
            return tokenInstance.approve(spendingAcc, 10, { from: fromAcc });
        }).then(function (reciept) {
            //Try transferring something larger than the sender's balance
            return tokenInstance.transferFrom(fromAcc, toAcc, 150, {from: spendingAcc});
        }).then(assert.fail).catch(function (error) {
            assert(error.message.toString().indexOf('revert') >=0, 'cannot transfer more than the owners balance');
            //Try transfering more than allowance
            return tokenInstance.transferFrom(fromAcc, toAcc, 15, {from: spendingAcc});
        }).then(assert.fail).catch(function (error) {
            assert(error.message.toString().indexOf('revert') >=0, 'cannot transfer more than the allowance');
            //Try transferring appropriate amount
        return tokenInstance.transferFrom.call(fromAcc, toAcc, 6, {from: spendingAcc});
        }).then(function (success) {
            assert.equal(success, true, 'returns true on successful return');
    
        return tokenInstance.transferFrom(fromAcc, toAcc, 6, { from: spendingAcc });
        }).then(function (reciept) {
            assert.equal(reciept.logs.length, 1, 'triggers one event');
            assert.equal(reciept.logs[0].event, 'Transfer', 'triggers a "Transfer" event');
            assert.equal(reciept.logs[0].args._from, fromAcc, 'correct from address');
            assert.equal(reciept.logs[0].args._to, toAcc, 'correct to address');
            assert.equal(reciept.logs[0].args._value, 6, 'correct value');

            
            return tokenInstance.balanceOf(toAcc);
        }).then(function (balance) { 
            assert.equal(balance.toNumber(), 6, 'it adds the amount to the reciever account');
            return tokenInstance.balanceOf(fromAcc);
        }).then(function (balance) { 
            assert.equal(balance.toNumber(), 94, 'it reduces the balance of sender account');
            return tokenInstance.allowance(fromAcc, spendingAcc);
        }).then(function (allowance) {
            assert.equal(allowance.toNumber(), 4, 'it reduces the allowance');
        })
    });
    
})