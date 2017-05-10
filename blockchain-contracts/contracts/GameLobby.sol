pragma solidity ^0.4.0;

import "./Game.sol";
import "./HighScore.sol";

contract GameLobby{

    address lobbyOwner;

    address[] public availablePlayers;
    bool gameStarted;
    address[] games;
    mapping(address => int) public leaderboard;
    
    address public highscoreAddr;
    event GameCreated(address game, address player1, address player2);
    event PlayerJoined(address player);

    function GameLobby(){
        lobbyOwner = msg.sender;
        highscoreAddr = new HighScore(this);
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

    function countUsersInLobby() constant returns (uint){
        uint playerCount = 0;
        for (var countIndex = 0; countIndex < availablePlayers.length; countIndex++) {
            playerCount = playerCount + 1;
        }
        return playerCount;


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
                if(game.player1() == player || game.player2() == player){
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
            
            if(!playerInLobby(availablePlayer)){
                availablePlayers.push(availablePlayer);
                PlayerJoined(availablePlayer);
            }
        }        
    }

    function playerInLobby(address playerAddr) constant returns (bool){
        bool alreadyJoined = false;
        for (uint p = 0; p < availablePlayers.length; p++)
        {
            if(availablePlayers[p] == playerAddr){
                alreadyJoined = true;
            }
        } 
        return alreadyJoined;
    }

    function startGame(address player1, address player2){
         if(gameStarted == true){
            address newGame = new Game(player1, player2, highscoreAddr);
            games.push(newGame);
            GameCreated(newGame, player1, player2);
            var scorer = HighScore(highscoreAddr);
            scorer.addAllowedGame(newGame, this);
         }
    }


}