pragma solidity ^0.4.0;

contract HighScore {

    mapping(address => uint) public leaderboard;
    
    address[] allowedGames;    
    address owner;

    event HighScoreChanged(address player, uint score);

    function HighScore(address lobbyAddr){
        owner = lobbyAddr;
    }

    function addAllowedGame(address gameAddr, address lobbyAddr){
        if(lobbyAddr == owner){
            allowedGames.push(gameAddr);
        }
    }

    function highScoreOfPlayer(address player) constant returns (uint){
        return leaderboard[player];
    }

    function increaseHighScore(address player, address gameAddr){
        bool authorizedGame = false;
        for (var index = 0; index < allowedGames.length; index++) {
            if(allowedGames[index] == gameAddr){
                authorizedGame = true;
            }
        }
        if(authorizedGame)
        {
            leaderboard[player]++;
            HighScoreChanged(player, leaderboard[player]);
        }

    }     
        
}