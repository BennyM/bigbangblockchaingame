const Web3 = require('web3')
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
var BlindGame = artifacts.require("BlindGame");
var abi = require('ethereumjs-abi');

contract('BlindGame', function(accounts) {
  it("init with blinds", function(done) {
    var account0 = accounts[0];
    var account1 = accounts[1];

    var hash0 = "0x" +abi.soliditySHA3(
    [  "uint8", "string" ],
    [ 1, 'salt1']).toString('hex');
    console.log('web3 hash');
    console.log(hash0);

    var hash1 = "0x"+abi.soliditySHA3(
    [  "uint8", "string" ],
    [ 2, "salt2" ]).toString('hex');

    var game;
    BlindGame.new(account0, account1, hash0, hash1, {from: account0})
      .then(function(createdGame){
        game = createdGame;
        assert.isOk(game);
        console.log("asserted game")
         return game.revealHand(1, 'salt1', {from: account0});
      })
      .then(function(tx){
        console.log('revealed hand');
        assert.isOk(tx.receipt);
        console.log('asserted revealed hand');
        return game.revealHand(2, 'salt2', {from: account1});
      })
      .then(function(tx){
        assert.isOk(tx.receipt);
        return game.winner.call();
      })
      .then(function(winner){
        assert.equal(account1, winner);
      })
      .then(done).catch(done);
  })});