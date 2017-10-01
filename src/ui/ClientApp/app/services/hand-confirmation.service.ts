import { Game } from './games.service';
import { Injectable } from '@angular/core';
import { GameDatabaseService, GameData, GameHand, GameDto } from './game-database.service';
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
            .then(gameData => {
                if (!gameData.game) {
                    gameData = new GameData(new GameDto(gameInfo.id));
                }
                
                let lastLocalRound = gameData.lastRound();

                if(lastLocalRound && 
                    gameInfo.currentRound == lastLocalRound.round && 
                    gameInfo.canBeConfirmed && gameInfo.address &&
                    (!lastLocalRound.revealed && (!lastLocalRound.startedReveal || new Date().getTime() - lastLocalRound.startedReveal.getTime() > 5 * 60 * 1000) )){
                        let contract = this.BlindGame.at(gameInfo.address);
                        lastLocalRound.startedReveal = new Date();
                        this.database.storeGame(gameData)
                            .then(() => contract.revealHand(lastLocalRound.hand, lastLocalRound.salt, {from: this.walletService.getWallet().getAddresses()[0]}))
                            .then( () => 
                                contract.getHandFrom.call(lastLocalRound.round, {from:this.walletService.getWallet().getAddresses()[0] }) )
                            .then( handInfo=>{
                                if((gameInfo.gameInitiated && handInfo[1].toNumber() > 0) || (!gameInfo.gameInitiated && handInfo[3].toNumber() > 0) ){
                                    lastLocalRound.revealed = true;
                                    console.log('state is ok');
                                    return this.database.storeGame(gameData);
                                } else{
                                    console.log('oops try again later');
                                }
                            })
                            .catch(ex => console.log(ex));
                }
                else{
            
                    this.database.storeGame(gameData);
                }
            });

    }

}
