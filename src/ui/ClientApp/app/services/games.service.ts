import { AuthenticatedHttp } from './authenticated-http';
import { Injectable } from '@angular/core';
import { Hands } from "../Hands";
import * as randomstring from 'randomstring';
import * as abi from 'ethereumjs-abi';

@Injectable()
export class GamesService {

    constructor(private authenticatedHttp: AuthenticatedHttp) {
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
            .post('http://localhost:5000/api/games', {opponentId: opponentId, hashedHand: hashedHand}) // todo fix urls
            .toPromise()
            .then(resp => {
                //todo save game id + salt + hand in localstorage
            });
    }
}

export class Game {
    opponentName: string;
    challengerName: string;
    address: string;
}