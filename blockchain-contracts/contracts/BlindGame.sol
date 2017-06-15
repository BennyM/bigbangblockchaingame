pragma solidity ^0.4.4;

contract BlindGame {

    enum State { None, Rock, Paper, Scissor, Lizard, Spock } 
    
    event GameEnd(address winner, address loser, State winningHand, State losingHand); 
    event Draw(State draw, uint newRoundNumber);
    event StartReveal(uint roundNumber);

    struct Hand{
        bytes32 blindHand;
        State playerHand;        
    }

    address public gameMaster;
    address public player1;
    address public player2;
    address public winner;
    Hand[] player1Hands;
    Hand[] player2Hands;

    function BlindGame(address player1addr, address player2addr, bytes32 blindplayer1Hand, bytes32 blindplayer2Hand){
        player1 = player1addr;
        player2 = player2addr;
        gameMaster = msg.sender;
        player1Hands.push(Hand({playerHand: State.None, blindHand : blindplayer1Hand}));
        player2Hands.push(Hand({playerHand: State.None, blindHand : blindplayer2Hand}));
    }

    function getHandFrom(uint index) constant returns (bytes32, uint8, bytes32, uint8){
        bytes32 bs1 = player1Hands[index].blindHand;
        State s1 = player1Hands[index].playerHand;
        bytes32 bs2 = player2Hands[index].blindHand;
        State s2 = player2Hands[index].playerHand; 
        return(bs1, uint8(s1), bs2, uint8(s2));
    }

    function isEmptyBytes32(bytes32 val) constant returns (bool) {
        bytes32 empty;
        return val == empty;
    }

    function revealHand(State hand, string secret) {
        var currentRoundIndex = player1Hands.length -1;
        var currentRoundPlayer1 = player1Hands[currentRoundIndex];
        var currentRoundPlayer2 = player2Hands[currentRoundIndex];
        if(winner != player1 && winner != player2 && !isEmptyBytes32(currentRoundPlayer1.blindHand)  && !isEmptyBytes32(currentRoundPlayer2.blindHand))
        {
            if(msg.sender == player1 && currentRoundPlayer1.playerHand == State.None)
            {
                if(currentRoundPlayer1.blindHand == keccak256(hand, secret))
                {
                    currentRoundPlayer1.playerHand = hand;
                }
            }
            else if(msg.sender == player2 && currentRoundPlayer2.playerHand == State.None)
            {
                if(currentRoundPlayer2.blindHand == keccak256(hand, secret))
                {
                    currentRoundPlayer2.playerHand = hand;
                }
            }
            if(currentRoundPlayer1.playerHand != State.None && currentRoundPlayer2.playerHand != State.None)
            {
                declareWinner(currentRoundPlayer1, currentRoundPlayer2);
            }
        }        
    }

    function playHand(bytes32 blindHand) {
        var currentRoundIndex = player1Hands.length -1;
        var currentRoundPlayer1 = player1Hands[currentRoundIndex];
        var currentRoundPlayer2 = player2Hands[currentRoundIndex];
        if(msg.sender == player1 && isEmptyBytes32(currentRoundPlayer1.blindHand)){
            currentRoundPlayer1.blindHand = blindHand;
        }
        else if(msg.sender == player2 && isEmptyBytes32(currentRoundPlayer2.blindHand)){
            currentRoundPlayer2.blindHand = blindHand;
        }
        if(!isEmptyBytes32(currentRoundPlayer1.blindHand) && !isEmptyBytes32(currentRoundPlayer2.blindHand)){
           StartReveal(currentRoundIndex);
        }
    }

    function playHands(bytes32 blindHandPlayer1, bytes32 blindHandPlayer2){
        if(msg.sender == gameMaster){
            var currentRoundIndex = player1Hands.length - 1;
            var currentRoundPlayer1 = player1Hands[currentRoundIndex];
            var currentRoundPlayer2 = player2Hands[currentRoundIndex];
            if(isEmptyBytes32(currentRoundPlayer1.blindHand)){
                currentRoundPlayer1.blindHand = blindHandPlayer1;
            }
            if(isEmptyBytes32(currentRoundPlayer2.blindHand)){
                currentRoundPlayer2.blindHand = blindHandPlayer2;
            }
            if(!isEmptyBytes32(currentRoundPlayer1.blindHand) && !isEmptyBytes32(currentRoundPlayer2.blindHand)){
                StartReveal(currentRoundIndex);
            }
        }
    }

    function declareWinner(Hand player1Hand, Hand player2Hand) private{
         if(player1Hand.playerHand != State.None && player2Hand.playerHand != State.None){
             if(player1Hand.playerHand == player2Hand.playerHand){
                player1Hands.push(
                    Hand({
                        blindHand : 0,
                        playerHand : State.None
                    })
                );
                player2Hands.push(
                    Hand({
                        blindHand : 0,
                        playerHand : State.None
                    })
                );
                Draw(player1Hand.playerHand, player1Hands.length - 1);
            }
        
        else { 
            address loser;
            State losingHand;
            State winningHand;
            if(player1Hand.playerHand == State.Rock && (player2Hand.playerHand == State.Lizard || player2Hand.playerHand == State.Scissor)){
                winner = player1;
                loser = player2;
                losingHand = player2Hand.playerHand;
                winningHand = player1Hand.playerHand;
            } else if(player1Hand.playerHand == State.Paper && (player2Hand.playerHand== State.Rock || player2Hand.playerHand == State.Spock))
            {
                winner = player1;
                loser = player2;
                losingHand = player2Hand.playerHand;
                winningHand = player1Hand.playerHand;
            }
            else if(player1Hand.playerHand == State.Scissor && (player2Hand.playerHand == State.Paper || player2Hand.playerHand == State.Lizard))
            {
                winner = player1;
                loser = player2;
                losingHand = player2Hand.playerHand;
                winningHand = player1Hand.playerHand;
            }
            else if(player1Hand.playerHand == State.Lizard && (player2Hand.playerHand == State.Spock || player2Hand.playerHand == State.Paper))
            {
                winner = player1;
                loser = player2;
                losingHand = player2Hand.playerHand;
                winningHand = player1Hand.playerHand;
            }
            else if(player1Hand.playerHand == State.Spock && (player2Hand.playerHand == State.Scissor || player2Hand.playerHand == State.Rock))
            {
                winner = player1;
                loser = player2;
                losingHand = player2Hand.playerHand;
                winningHand = player1Hand.playerHand;
            }
            else
            {
                winner = player2;
                loser = player1;
                losingHand = player1Hand.playerHand;
                winningHand = player2Hand.playerHand;
            }
            GameEnd(winner, loser, winningHand, losingHand);
        }}
    }    
}