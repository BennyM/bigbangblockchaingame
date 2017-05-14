/*// Specifically request an abstraction for MetaCoin
var GameLobby = artifacts.require("GameLobby");

contract('GameLobby', function(accounts) {
  it("creater opens lobby", function() {
    var lobby;
    return GameLobby.new({from:accounts[0]})
      .then(function(instance) {
        lobby = instance;
        return instance.openLobby({from:accounts[0]})})
      .then(function(){
        return lobby.signup(accounts[0], {from:accounts[0]})
      })
      .then(function(){
        return lobby.countUsersInLobby.call()
      })
      .then(function(count){
        assert.equal(1, count);
      });
    });
  });*/