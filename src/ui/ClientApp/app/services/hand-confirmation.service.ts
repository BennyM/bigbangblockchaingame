import { Injectable } from '@angular/core';
import { GameDatabaseService, HandCorrelationData } from './game-database.service';
import { WalletService } from './wallet.service';
import { Web3ProviderService } from './web3provider.service';
import * as contract from 'truffle-contract';
import * as blindgame_artifacts from '../contracts-abi/BlindGame.json';

@Injectable()
export class HandConfirmationService {

    private watchedGames: GameData[];
    private watchedGameAddresses: string[];
    private BlindGame: any;

    constructor(private web3Provider: Web3ProviderService, private database: GameDatabaseService) {
        this.watchedGames = [];
        this.watchedGameAddresses = [];
        let artifact = blindgame_artifacts;
        this.BlindGame = contract(artifact);
        this.BlindGame.setProvider(web3Provider.getOrCreateWeb3Provider());
    }

    public watchGame(address: string) {
        let index = this.watchedGameAddresses.indexOf(address);
        if (index === -1) {
            let data : GameData;
                let game = this.BlindGame.at(address);
                this.watchedGameAddresses.push(address);
                let revealHand = game.StartReveal();
                let drawEvent = game.Draw();
                let gameEnd = game.GameEnd();
                this.watchedGames.push({
                    address: address,
                    game: game,
                    revealHandEvent: revealHand,
                    drawEvent: drawEvent,
                    gameEndEvent: gameEnd
                });
                this.watchedGames.push({
                    game : game,
                    address : address,
                    revealHandEvent : revealHand,
                    drawEvent : drawEvent,
                    gameEndEvent : gameEnd
                });
                revealHand.watch((error, result) => {
                    if (error == null) {
                        console.log(result.args);
                        this.database.findHand(address).then(playedHand => {
                            game.revealHand(playedHand.hand, playedHand.salt).catch(ex => console.log(ex));
                        });
                    } else {
                        console.log(error);
                    }
                });
                gameEnd.watch((error, result) => {
                    if (error == null) {
                        console.log('winner');
                        console.log(result.args);
                    } else {
                        console.log(error);
                    }
                });
      

        }
    }

}

class GameData {
    address: string;
    game: any;
    revealHandEvent: any;
    drawEvent: any;
    gameEndEvent: any;

}