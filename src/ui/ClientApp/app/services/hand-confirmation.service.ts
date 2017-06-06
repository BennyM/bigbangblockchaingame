import { Game } from './games.service';
import { Injectable } from '@angular/core';
import { GameDatabaseService } from './game-database.service';
import { WalletService } from './wallet.service';
import { Web3ProviderService } from './web3provider.service';
import * as contract from 'truffle-contract';
import * as blindgame_artifacts from '../contracts-abi/BlindGame.json';

@Injectable()
export class HandConfirmationService {

    private watchedGames: GameData[];
    private watchedGameAddresses: string[];
    private BlindGame: any;

    constructor(private web3Provider: Web3ProviderService, private database: GameDatabaseService, private walletService : WalletService) {
        this.watchedGames = [];
        this.watchedGameAddresses = [];
        let artifact = blindgame_artifacts;
        this.BlindGame = contract(artifact);
        this.BlindGame.setProvider(web3Provider.getOrCreateWeb3Provider());
    }

    public watchGame(gameInfo: Game) {
        if (gameInfo.address) {
            let index = this.watchedGameAddresses.indexOf(gameInfo.address);
            if (index === -1) {
                let data: GameData;
                let game = this.BlindGame.at(gameInfo.address);
                this.watchedGames.push({
                    address: gameInfo.address,
                    game: game
                });
                this.watchedGameAddresses.push(gameInfo.address);
                this.database.updateGameAddress(gameInfo.id, gameInfo.address)
                .then(() => this.database.findHand(gameInfo.address))
                .then( (hand) => {
                    game.revealHand(hand.hand, hand.salt, {from: this.walletService.getWallet().getAddresses()[0]})
                        .then(() => console.log('did it'))
                        .catch(ex => console.log(ex));}
                );
    
            }
        
        }

    }

}

class GameData {
    address: string;
    game: any;
   

}