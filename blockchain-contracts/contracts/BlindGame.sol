pragma solidity ^0.4.4;

contract BlindGame {

    enum State { None, Rock, Paper, Scissor, Lizard, Spock } 
    
    event GameEnd(address winner, address loser); 
    event Draw(State draw);
    event StartReveal();
    
    struct Hand{
        bytes32 blindHand1;
        bytes32 blindHand2;
        State player1Hand;
        State player2Hand;        
    }

    address public player1;
    address public player2;
    address public winner;
    Hand[] public hands;

    function BlindGame(address player1addr, address player2addr, bytes32 blindplayer1Hand, bytes32 blindplayer2Hand){
        player1 = player1addr;
        player2 = player2addr;
        hands.push(Hand({player1Hand: State.None, player2Hand: State.None, blindHand1: blindplayer1Hand, blindHand2 : blindplayer2Hand}));
        StartReveal();
    }

    function getHandFrom(uint index) constant returns (bytes32, uint8, bytes32, uint8)
    {
        bytes32 bs1 = hands[index].blindHand1;
        State s1 = hands[index].player1Hand;
        bytes32 bs2 = hands[index].blindHand2;
        State s2 = hands[index].player2Hand; 
        return(bs1, uint8(s1), bs2, uint8(s2));
    }

    function hash(State hand, string secret) returns (bytes32)
    {
        return keccak256(hand, secret);
    }

    function revealHand(State hand, string secret) {        
        var currentRound = hands[hands.length - 1];
        if(winner != player1 && winner != player2)
        {
            if(msg.sender == player1 && currentRound.player1Hand == State.None)
            {
                if(currentRound.blindHand1 == keccak256(hand, secret))
                {
                    currentRound.player1Hand = hand;
                }
            }
            else if(msg.sender == player2 && currentRound.player2Hand == State.None)
            {
                if(currentRound.blindHand2 == keccak256(hand, secret))
                {
                    currentRound.player2Hand = hand;
                }
            }
            if(currentRound.player1Hand != State.None && currentRound.player2Hand != State.None)
            {
                declareWinner(currentRound);
            }
        }        
    }

    function playHand(bytes32 blindHand) {
        var currentRound = hands[hands.length - 1];
        if(msg.sender == player1 && currentRound.blindHand1.length == 0)
        {
            currentRound.blindHand1 = blindHand;
        }
        else if(msg.sender == player2 && currentRound.blindHand2.length == 0)
        {
            currentRound.blindHand2 = blindHand;
        }
        if(currentRound.blindHand1.length > 0 && currentRound.blindHand2.length > 0)
        {
            StartReveal();
        }
    }

    function declareWinner(Hand currentRound) private{
         if(currentRound.player1Hand != State.None && currentRound.player2Hand != State.None){
             if(currentRound.player1Hand == currentRound.player2Hand){
                hands.push(Hand({player1Hand : State.None, player2Hand : State.None, blindHand1 : 0, blindHand2 : 0}));
                Draw(currentRound.player1Hand);
            }
        
        else { 
            address loser;
            if(currentRound.player1Hand == State.Rock && (currentRound.player2Hand == State.Lizard || currentRound.player2Hand == State.Scissor)){
                winner = player1;
                loser = player2;
            } else if(currentRound.player1Hand == State.Paper && (currentRound.player2Hand == State.Rock || currentRound.player2Hand == State.Spock))
            {
                winner = player1;
                loser = player2;
            }
            else if(currentRound.player1Hand == State.Scissor && (currentRound.player2Hand == State.Paper || currentRound.player2Hand == State.Lizard))
            {
                winner = player1;
                loser = player2;
            }
            else if(currentRound.player1Hand == State.Lizard && (currentRound.player2Hand == State.Spock || currentRound.player2Hand == State.Paper))
            {
                winner = player1;
                loser = player2;
            }
            else if(currentRound.player1Hand == State.Spock && (currentRound.player2Hand == State.Scissor || currentRound.player2Hand == State.Rock))
            {
                winner = player1;
                loser = player2;
            }
            else
            {
                winner = player2;
                loser = player1;
            }
            GameEnd(winner, loser);
        }}
    }    
}