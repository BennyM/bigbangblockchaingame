var accounts;
var account;
var runit;
var lobby;
var game;
var web3Provider;
var global_keystore;
window.onload = function () {



  lightwallet.keystore.createVault({
    password: 'password',
    // seedPhrase: seedPhrase, // Optionally provide a 12-word seed phrase
    // salt: fixture.salt,     // Optionally provide a salt.
    // A unique salt will be generated otherwise.
    // hdPathString: hdPath    // Optional custom HD Path String
  }, function (err, ks) {
    console.log('this is the keystore');
    console.log(ks);
    if (ks) {
      // Some methods will require providing the `pwDerivedKey`,
      // Allowing you to only decrypt private keys on an as-needed basis.
      // You can generate that value with this convenient method:
      ks.passwordProvider = function (callback) {

        callback(null, 'password');
      };
      global_keystore = ks;
      web3Provider = new HookedWeb3Provider({
        host: "http://clbrewaji.westeurope.cloudapp.azure.com:8545",
        transaction_signer: ks
      });
      ks.keyFromPassword('password', function (err, pwDerivedKey) {
        if (err) throw err;

        // generate five new address/private key pairs
        // the corresponding private keys are also encrypted

        ks.generateNewAddress(pwDerivedKey, 5);
        var addr = ks.getAddresses();
        console.log('addresses:');
        console.log(addr);
        console.log(addr[0]);
        console.log(addr[1]);

      });
    }

  });





  runit = function RunTheApp() {

    web3.setProvider(web3Provider);
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      // console.log(global_keystore.getAddresses());
      let account0 = "0x" + global_keystore.getAddresses()[0];
      let account1 = "0x" + global_keystore.getAddresses()[1];

      var gameAddress;

      var gameEndEvent;
      var gameStarted;
      // console.log(web3Provider);
      GameLobby.setProvider(web3Provider);
      Game.setProvider(web3Provider);
      GameLobby.new({ from: account0, gas: 4000000, gasPrice: 20000000000 })
        .then(function (instance) {
          console.log('lobby available at :' + instance.address);
          lobby = GameLobby.at(instance.address);
          gameStarted = lobby.GameCreated();
          gameStarted.watch(function (error, result) {
            if (!error)
              console.log('in game event handler')
            console.log(result);
            gameAddress = result.args.game;
            game = Game.at(gameAddress);
            gameEndEvent = game.Winner(function (winnerError, winnerResult) {
              if (!winnerError) {
                console.log(winnerResult);
                console.log('winner: ' + winnerResult.args.winner);
                console.log('loser: ' + winnerResult.args.loser);
                console.log('winner: ' + winnerResult.args.winnerState);
                console.log('loser: ' + winnerResult.args.loserState);
              }
            });
            game.playHand(1, { from: account0, gas: 4000000, gasPrice: 20000000000 })
              .then(function () {
                console.log('play hand 2');
                return game.playHand(2, { from: account1, gas: 4000000, gasPrice: 20000000000 })

              })
          });

          return lobby.openLobby({ from: account0, gas: 4000000, gasPrice: 20000000000 })
        })

        .then(function (tx_id) {
          console.log('open for business');
          console.log('sign up player 1');
          return lobby.signup(account0, { from: account0, gas: 4000000, gasPrice: 20000000000 });
        })
        .then(function () {
          console.log('sign up player 2');
          return lobby.signup(account1, { from: account1, gas: 4000000, gasPrice: 20000000000 });
        })
        .then(function (tx_id) {
          console.log('signed up');


          console.log('start game');
          return lobby.startGame(account0, account1, { from: account0, gas: 4000000, gasPrice: 20000000000 });
        })

        .catch(function (e) {
          console.log(e);
        });
    });
  }
}



