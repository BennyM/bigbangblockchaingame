import { AuthenticatedHttp } from './../../services/authenticated-http';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'player-list',
    templateUrl: './player-list.component.html'
})
export class PlayerListComponent implements OnInit {
    public players: Player[];

    constructor(private http: AuthenticatedHttp) {
    }

    ngOnInit(): void {
        this.http.get('http://localhost:5000/api/players') // todo fix urls
            .toPromise()
            .then(resp => {
                this.players = resp.json() as Player[];
            });
    }
}

interface Player {
    id: string;
    nickname: string
}
