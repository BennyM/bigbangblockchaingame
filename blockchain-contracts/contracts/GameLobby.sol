pragma solidity ^0.4.0;

import "Game.sol";

contract GameLobby{

    address lobbyOwner;

    address[] availablePlayers;
    bool gameStarted;
    address[] games;
    mapping(address => int) public leaderboard;

    event GameCreated(address game, address player1, address player2);

    function GameLobby(){
        lobbyOwner = msg.sender;
        gameStarted = false;    
    }

    function openLobby(){
        if(msg.sender == lobbyOwner){
            gameStarted  = true;
        }
    }

    function closeLobby(){
        if(msg.sender == lobbyOwner){
            gameStarted = false;
        }
    }

    function signup(address availablePlayer){
        if(gameStarted == true){
            availablePlayers.push(availablePlayer);
        }        
    }

    function startGame(address player1, address player2){
         if(gameStarted == true){
            address newGame = new Game(player1, player2);
            games.push(newGame);
            GameCreated(newGame, player1, player2);
         }
    }

    function gameEnded(address winner){
        for (uint index = 0;  index < games.length; index++) {
            if(games[index] == msg.sender)
            {
                leaderboard[winner]++;
            }
        }
    }



}