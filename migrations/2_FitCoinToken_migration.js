var FitCoinToken = artifacts.require("./FitCoinToken.sol");
var FitCoinTokenSale = artifacts.require("./FitCoinTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(FitCoinToken, 1000000).then(function() {
    // Token price is 0.001 Ether
    var tokenPrice = 1000000000000000;
    // var tokenPrice = 100000000000000000000000000000000000000;
    return deployer.deploy(FitCoinTokenSale, FitCoinToken.address, tokenPrice);
  });
};