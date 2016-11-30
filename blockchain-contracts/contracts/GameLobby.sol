pragma solidity ^0.4.0;

import "Game.sol";

contract GameLobby{

    address lobbyOwner;

    address[] public availablePlayers;
    bool gameStarted;
    address[] games;
    mapping(address => int) public leaderboard;

    event GameCreated(address game, address player1, address player2);

    function GameLobby(){
        lobbyOwner = msg.sender;
        gameStarted = false;    
    }

    function countGamesOfUser(address player) constant returns (uint)
    {
        uint gameCount = 0;
        for (var countIndex = 0; countIndex < games.length; countIndex++) {
            var possibleGame = Game(games[countIndex]);
            if(possibleGame.player1() == player || possibleGame.player2() == player){
                gameCount++;
            }
        }
        return gameCount;
    }

    function gamesOfUser(uint skipGames) constant returns (address[])
    {       
        var player = msg.sender;
        uint gamesToReturn = 100;
        address[]  memory usergames = new address[](gamesToReturn);
       
        uint gamesFound = 0;
        uint skippedGames = 0;
        uint gameIndex = 0;
        for (var index = 0; index < games.length; index++) {
            if(gamesFound < gamesToReturn)
            {
                var game = Game(games[index]);
                if(game.player1() == msg.sender || game.player2() == msg.sender){
                    if(skippedGames < skipGames)
                    {
                        skippedGames++;
                    }
                    else
                    {
                        gamesFound++;
                        usergames[gameIndex];
                        gameIndex++;
                    }                    
                }
            }            
        }
        return usergames;
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


}