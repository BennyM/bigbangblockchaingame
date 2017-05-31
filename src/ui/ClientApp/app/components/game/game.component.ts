import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { default as contract } from 'truffle-contract';
//import blindgame_artifacts from '../contracts-abi/BlindGame.json';

@Component({
    selector: 'game',
    templateUrl: './game.component.html'
})
export class GameComponent {

    handState : any = { none: 0, rock: 1, paper: 2, scissors: 3, lizard: 4, spock: 5 };
    draws : any[];
    account : string;
    playedHand : any;

    // constructor(http: Http) {
    //     this.draws = [];
    //     this.account = "0x"; //+ $rootScope.globalKeystore.getAddresses()[0];
    //     var BlindGame = contract(blindgame_artifacts);
    //      BlindGame.setProvider(undefined);//$rootScope.web3Provider);
    //     var game = BlindGame.at(null);//$stateParams.gameid);
    //     this.playedHand = this.handState.none;
    // }
}

