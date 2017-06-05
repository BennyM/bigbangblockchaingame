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
    private db: AngularIndexedDB;

    constructor(private authenticatedHttp: AuthenticatedHttp, private configService: ConfigService) {
        this.gamesOfUser = this.getGamesOfUser();
        this.db = new AngularIndexedDB('bbbgdb', 1);
        this.db.createStore(1, (evt) => {
            let objectStore = evt.currentTarget.result.createObjectStore(
                'games', { keyPath: "id", autoIncrement: false });
            objectStore.createIndex("address", "address", { unique: false });
        });
    }

    private getGamesOfUser(): Observable<Game[]> {
        return Observable
            .timer(0, 2000)
            .mergeMap(() => this.authenticatedHttp.get(`${this.configService.apiUrl}/api/games`))
            .map(resp => {
                let games = resp.json() as Game[];
                games.forEach(item => {
                    this.db.update('games', { id: item.id, address: item.address }).then(() => {
                    }, (error) => {
                        console.log(error);
                    });
                });
                return games
            });
    }

    challengeOpponent(opponentId: string, hand: Hands): Promise<void> {
        var salt = randomstring.generate(7);
        var hashedHand = '0x' + abi.soliditySHA3(['uint8', 'string'], [hand, salt]).toString('hex');

        return this.authenticatedHttp
            .post(`${this.configService.apiUrl}/api/games`, { opponentId: opponentId, hashedHand: hashedHand })
            .toPromise()
            .then(resp => {
                return this.db.add('games', { salt: salt, hand: hand, id: new Number(resp.text()) })
            });
    }

    respondToChallenge(gameId: number, hand: Hands): Promise<void> {
        var salt = randomstring.generate(7);
        var hashedHand = '0x' + abi.soliditySHA3(['uint8', 'string'], [hand, salt]).toString('hex');

        return this.authenticatedHttp
            .post(`${this.configService.apiUrl}/api/games/${gameId}/hand`, { hashedHand: hashedHand })
            .toPromise()
            .then(resp => {
                return this.db.add('games', { salt: salt, hand: hand, id: gameId })
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