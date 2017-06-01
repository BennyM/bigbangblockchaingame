import { AuthenticatedHttp } from './authenticated-http';
import { Injectable } from '@angular/core';

@Injectable()
export class GamesService {

    constructor(private authenticatedHttp: AuthenticatedHttp) {
    }

    getGamesOfUser(): Promise<Game[]> {
        return this.authenticatedHttp
            .get('http://localhost:5000/api/games') // todo fix urls
            .toPromise()
            .then(resp => {
                return resp.json().data as Game[];
            });
    }
}

export class Game {
    opponentName: string;
    challengerName: string;
    address: string;
}