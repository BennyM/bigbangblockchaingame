import { ConfigService } from './../../services/config.service';
import { Router } from '@angular/router';
import { AuthenticatedHttp } from './../../services/authenticated-http';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'player-list',
    templateUrl: './player-list.component.html'
})
export class PlayerListComponent implements OnInit {
    public players: Player[];

    constructor(private http: AuthenticatedHttp, private router: Router, private configService: ConfigService) {
    }

    ngOnInit(): void {
        this.http.get(`${this.configService.apiUrl}/api/players`)
            .toPromise()
            .then(resp => {
                this.players = resp.json() as Player[];
            });
    }

    onPlayerSelect(player: Player): void {
        this.router.navigate(['/challenge', player.id, player.nickname]);
    }
}

interface Player {
    id: string;
    nickname: string
}
