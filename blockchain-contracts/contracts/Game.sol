pragma solidity ^0.4.0;


contract Game {

    enum State { None, Rock, Paper, Scissor, Lizard, Spock } 
    
    event Winner(address winner, address loser, State winnerState, State loserState); 
    event Draw(State draw);

    struct Hand{
        State player1Hand;
        State player2Hand;        
    }

    address public player1;
    address public player2;
    address public winner;
    address gameLobbyaddr;
    State public lastPlayedHand1;
    State public lastPlayedHand2;
    Hand[] public hands;

    function Game(address player1addr, address player2addr){
        gameLobbyaddr = msg.sender;
        lastPlayedHand1 = State.None;
        lastPlayedHand2 = State.None;
        player1 = player1addr;
        player2 = player2addr;
    }

    function playHand(State hand){        
        if(winner != player1 && winner != player2)
        {
            if(msg.sender == player1 && lastPlayedHand1 == State.None)
            {
                lastPlayedHand1 = hand;
            }
            else if(msg.sender == player2 && lastPlayedHand2 == State.None)
            {
                lastPlayedHand2 = hand;
            }
            if(lastPlayedHand1 != State.None && lastPlayedHand2 != State.None)
            {
                declareWinner();
            }
        }        
    }

     function declareWinner(){
        if(lastPlayedHand1 == lastPlayedHand2){
            var playedState = lastPlayedHand1;
            hands.push(Hand({player1Hand: lastPlayedHand1, player2Hand: lastPlayedHand2}));
            lastPlayedHand1 = State.None;
            lastPlayedHand2 = State.None;
            Draw(playedState);
        } 
        else
        {          
            State winningHand;
            State losingHand;  
            address loser;
            if(lastPlayedHand1 == State.Rock && (lastPlayedHand2 == State.Lizard || lastPlayedHand2 == State.Scissor)){
                winner = player1;
                winningHand = lastPlayedHand1;
                losingHand = lastPlayedHand2;
                loser = player2;
            } else if(lastPlayedHand1 == State.Paper && (lastPlayedHand2 == State.Rock || lastPlayedHand2 == State.Spock))
            {
                winner = player1;
                winningHand = lastPlayedHand1;
                losingHand = lastPlayedHand2;
                loser = player2;
            }
            else if(lastPlayedHand1 == State.Scissor && (lastPlayedHand2 == State.Paper || lastPlayedHand2 == State.Lizard))
            {
                winner = player1;
                winningHand = lastPlayedHand1;
                losingHand = lastPlayedHand2;
                loser = player2;
            }
            else if(lastPlayedHand1 == State.Lizard && (lastPlayedHand2 == State.Spock || lastPlayedHand2 == State.Paper))
            {
                winner = player1;
                winningHand = lastPlayedHand1;
                losingHand = lastPlayedHand2;
                loser = player2;
            }
            else if(lastPlayedHand1 == State.Spock && (lastPlayedHand2 == State.Scissor || lastPlayedHand2 == State.Rock))
            {
                winner = player1;
                winningHand = lastPlayedHand1;
                losingHand = lastPlayedHand2;
                loser = player2;
            }
            else
            {
                winner = player2;
                winningHand = lastPlayedHand2;
                losingHand = lastPlayedHand1;
                loser = player1;
            }
            Winner(winner, loser, winningHand, losingHand);
  //          GameLobby lobby = GameLobby(gameLobbyaddr);
  //         lobby.gameEnded(winner);
        }
    }    
}