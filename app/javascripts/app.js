var accounts;
var account;

function setStatus(message) {
  var status = document.getElementById("status");
  status.innerHTML = message;
};

function refreshBalance() {
  var meta = MetaCoin.deployed();

  meta.getBalance.call(account, {from: account}).then(function(value) {
  console.log(value);
  }).catch(function(e) {
    console.log(e);
    setStatus("Error getting balance; see log.");
  });
};

function sendCoin() {
  var meta = MetaCoin.deployed();

  var amount = parseInt(document.getElementById("amount").value);
  var receiver = document.getElementById("receiver").value;

  setStatus("Initiating transaction... (please wait)");

  meta.sendCoin(receiver, amount, {from: account}).then(function() {
    setStatus("Transaction complete!");
    refreshBalance();
  }).catch(function(e) {
    console.log(e);
    setStatus("Error sending coin; see log.");
  });
};

window.onload = function() {
  
  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    accounts = accs;
    console.log(accounts);
    let account0 = accounts[0];
    let account1 = accounts[1];
    var game;
    var gameAddress;
    var lobby;
    var gameEndEvent;
  var gameStarted;
    GameLobby.new({from: account0, gas:4700000})
    .then(function(instance) {
      console.log('lobby available at :' + instance.address);
      lobby = GameLobby.at(instance.address);
      return lobby.openLobby({from: account0})})
    .then(function(tx_id){
        console.log('open for business');
        console.log('sign up player 1');
        return lobby.signup(account0, {from: account0});        
    })
    .then(function(){
      console.log('sign up player 2');
       return lobby.signup(account1, {from: account1});
    })
    .then(function(tx_id){
      console.log('signed up');
     gameStarted = lobby.GameCreated(function(error, result){
        if (!error)
          console.log('in game event handler')
         // console.log(result);
          gameAddress = result.args.game;
          game = Game.at(gameAddress);
          gameEndEvent = game.Winner(function(winnerError, winnerResult)
          {
            if(!winnerError){
              console.log('winner: ' + winnerResult.args.winner);
              console.log('loser: ' + winnerResult.args.loser);
              console.log('winner: ' + winnerResult.args.winnerState);
              console.log('loser: ' + winnerResult.args.loserState);
            }             
          });
                    
        });
        console.log('start game');
      return  lobby.startGame(account0, account1, {from: account0, gas: 4700000 });
    })
    .then(function(tx_id){
          console.log('game created');
          console.log('play hand 1');
         return game.playHand(1, {from: account0})
          
        })
      .then(function(){
        console.log('play hand 2');
            return game.playHand(2, {from: account1})
        
      })
    .catch(function(e) {
      console.log(e);  
  });
})};
