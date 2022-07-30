App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      
      console.log("If...")
      App.web3Provider = web3.currentProvider;
      ethereum.enable();
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      
      console.log("else...")
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("FitCoinTokenSale.json", function(fitcoinTokenSale) {
      App.contracts.FitCoinTokenSale = TruffleContract(fitcoinTokenSale);
      App.contracts.FitCoinTokenSale.setProvider(App.web3Provider);
      App.contracts.FitCoinTokenSale.deployed().then(function(fitcoinTokenSale) {
        console.log("FitCoin Token Sale Address:", fitcoinTokenSale.address);
        return fitcoinTokenSale.tokenPrice().then(function (price) { 
          console.log("Price is:", price.toNumber())
        })
      });
    }).done(function() {
      $.getJSON("FitCoinToken.json", function(fitcoinToken) {
        App.contracts.FitCoinToken = TruffleContract(fitcoinToken);
        App.contracts.FitCoinToken.setProvider(App.web3Provider);
        App.contracts.FitCoinToken.deployed().then(function(fitcoinToken) {
          console.log("FitCoin Token Address:", fitcoinToken.address);
        });

        App.listenForEvents();
        return App.render();
      });
    })
  },
  // Listen for events emitted from the contract
  listenForEvents: function () {
    console.log("Listening for events")
    App.contracts.FitCoinTokenSale.deployed().then(function (instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      }),
    instance.Transfer({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },

  render: function() {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    if(window.ethereum){
      ethereum.enable().then(function (acc) {
      console.log("Accounts ", acc)
      App.account = acc[0];
      $("#accountAddress").html("Your Account: " + App.account);
    })
    }
    console.log("Loading token sale contract")
    // Load token sale contract
    
    App.contracts.FitCoinTokenSale.deployed().then(function(instance) {
      tokenSaleInstance = instance;
      return tokenSaleInstance.tokenPrice();
    }).then(function (price) {
      console.log("Price is", price.toNumber());
      App.tokenPrice = price.toNumber();
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether"));
      return tokenSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber(); 
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);

      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

    
    // Load token contract
    App.contracts.FitCoinToken.deployed().then(function (instance) {
        FitCoinTokenInstance = instance;
        return FitCoinTokenInstance.balanceOf(App.account);
      }).then(function(balance) {
        $('.ftc-balance').html(balance.toNumber());
        App.loading = false;
        loader.hide();
        content.show();
      })
    });
  },

  buyTokens: function() {
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#numberOfTokens').val();
    App.contracts.FitCoinTokenSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit
      });
    }).then(function(result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
    });
  },

  transferTokens: function() {
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#numberOfTransferTokens').val();
    var recieverAddress = $('#recieverAddress').val();
    App.contracts.FitCoinToken.deployed().then(function (instance) {
      console.log("Transfer init..", instance)
      return instance.transfer(recieverAddress, numberOfTokens, {
        from: App.account,
        value: numberOfTokens * tokenPrice,
        gas: 500000 // Gas limit
      });
    }).then(function(result) {
      console.log(numberOfTokens, " Tokens transferring to ", recieverAddress)
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
    });
  }
}

$(function() {
  $(window).load(function() {
    App.init();
  })
});
