import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { Observable } from 'rxjs/Observable';
import { AuthenticatedHttp } from './authenticated-http';
import { Injectable } from '@angular/core';
import { Hands } from "../Hands";
import * as randomstring from 'randomstring';
import * as abi from 'ethereumjs-abi';


@Injectable()
export class GamesService {

    public observeGames: Observable<Game[]>;
    public games: Game[] = [];

    constructor(private authenticatedHttp: AuthenticatedHttp) {
        this.observeGames = IntervalObservable
            .create(1000)
            .mergeMap(() => this.authenticatedHttp.get('http://localhost:5000/api/games'))
            .map(res => {
                let parsed = <Game[]>res.json()
                return parsed;
            });
        let subscription = this.observeGames.subscribe(
            value => {
                this.games = value;
            },
            error => { },
            () => { }
        );
    }

    getGamesOfUser(): Promise<Game[]> {
        return this.authenticatedHttp
            .get('http://localhost:5000/api/games') // todo fix urls
            .toPromise()
            .then(resp => {
                return resp.json() as Game[];
            });
    }

    challengeOpponent(opponentId: string, hand: Hands): Promise<void> {
        var salt = randomstring.generate(7);
        var hashedHand = abi.soliditySHA3(['uint8', 'string'], [hand, salt]).toString('hex');
        console.log(`Hashed hand: ${hashedHand}`);

        return this.authenticatedHttp
            .post('http://localhost:5000/api/games', { opponentId: opponentId, hashedHand: hashedHand }) // todo fix urls
            .toPromise()
            .then(resp => {
                //todo save game id + salt + hand in localstorage
            });
    }
}

export class Game {
    OpponentName: string;
    address: string;
    id: number;
    handPlayed: boolean;
    createDate: Date;
    gameInitiated: boolean;
}