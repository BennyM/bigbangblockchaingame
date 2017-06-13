import { Game } from './games.service';
import { Injectable } from '@angular/core';
import { GameDatabaseService, GameData, GameHand } from './game-database.service';
import { WalletService } from './wallet.service';
import { Web3ProviderService } from './web3provider.service';
import * as contract from 'truffle-contract';
import * as blindgame_artifacts from '../contracts-abi/BlindGame.json';

@Injectable()
export class HandConfirmationService {

    private watchedGames: GameData[];
    private watchedGameAddresses: string[];
    private BlindGame: any;

    constructor(private web3Provider: Web3ProviderService, private database: GameDatabaseService, private walletService: WalletService) {
        this.watchedGames = [];
        this.watchedGameAddresses = [];
        let artifact = blindgame_artifacts;
        this.BlindGame = contract(artifact);
        this.BlindGame.setProvider(web3Provider.getOrCreateWeb3Provider());
    }

    public watchGame(gameInfo: Game) {
        this.database.findGameById(gameInfo.id)
            .then(game => {
                if (!game) {
                    game = new GameData(gameInfo.id);
                }
                
                let lastLocalRound = game.lastRound();

                if(lastLocalRound && 
                    gameInfo.currentRound == lastLocalRound.round && 
                    gameInfo.canBeConfirmed &&
                    (!lastLocalRound.revealed || (new Date().getTime() - lastLocalRound.startedReveal.getTime() > 5 * 1000) )){
                        let contract = this.BlindGame.at(gameInfo.address);
                        lastLocalRound.startedReveal = new Date();
                        this.database.storeGame(game)
                            .then(() => contract.revealHand(lastLocalRound.hand, lastLocalRound.salt, {from: this.walletService.getWallet().getAddresses()[0]}))
                            .then( () => {
                                lastLocalRound.revealed = true;
                                return this.database.storeGame(game);
                            })
                            .catch(ex => console.log(ex));
                }
                else{
            
                    this.database.storeGame(game);
                }
            });

    }

}
