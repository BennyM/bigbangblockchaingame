import { HandConfirmationService } from './hand-confirmation.service';
import { GameDatabaseService, HandCorrelationData } from './game-database.service';
import { StateService } from './state.service';
import { ConfigService } from './config.service';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { Observable } from 'rxjs/Observable';
import { AuthenticatedHttp } from './authenticated-http';
import { Injectable } from '@angular/core';
import { Hands } from "../Hands";
import * as randomstring from 'randomstring';
import * as abi from 'ethereumjs-abi';
import { AngularIndexedDB } from 'angular2-indexeddb';

@Injectable()
export class GamesService {

    public gamesOfUser: Observable<Game[]>;

    constructor(private authenticatedHttp: AuthenticatedHttp, private database: GameDatabaseService, private confirmationService : HandConfirmationService, private configService : ConfigService, private stateService : StateService) {
        this.gamesOfUser = this.getGamesOfUser();
    }

    private getGamesOfUser(): Observable<Game[]> {
        return Observable
            .timer(0, 2000)
            .mergeMap(() => this.authenticatedHttp.get(`${this.configService.apiUrl}/api/games`))
            .map(resp => {
                let games = resp.json() as Game[];
                games.forEach(item => {
                    this.database.updateGameAddress(item.id, item.address).then(() => {
                        if(item.address){
                            this.confirmationService.watchGame(item.address);
                        };
                    }, (error) => {
                        console.log(error);
                    });
                });
                return games
            });
    }

    challengeOpponent(opponentId: string, hand: Hands): Promise<void> {
        this.stateService.startLoading();
        var salt = randomstring.generate(7);
        var hashedHand = '0x' + abi.soliditySHA3(['uint8', 'string'], [hand, salt]).toString('hex');

        return this.authenticatedHttp
            .post(`${this.configService.apiUrl}/api/games`, { opponentId: opponentId, hashedHand: hashedHand })
            .toPromise()
            .then(resp => {
                return this.database.storeHand(new HandCorrelationData(hand, parseInt(resp.text()), salt))
            })
            .then(() => {
                this.stateService.doneLoading();
            });
    }

    respondToChallenge(gameId: number, hand: Hands): Promise<void> {
        this.stateService.startLoading();
        var salt = randomstring.generate(7);
        var hashedHand = '0x' + abi.soliditySHA3(['uint8', 'string'], [hand, salt]).toString('hex');

        return this.authenticatedHttp
            .post(`${this.configService.apiUrl}/api/games/${gameId}/hand`, { hashedHand: hashedHand })
            .toPromise()
            .then(resp => {
                  return this.database.storeHand(new HandCorrelationData(hand, gameId, salt))
            })
            .then(() => {
                this.stateService.doneLoading();
            });
    }
}

export class Game {
    opponentName: string;
    address: string;
    id: number;
    handPlayed: boolean;
    createDate: Date;
    gameInitiated: boolean;
}