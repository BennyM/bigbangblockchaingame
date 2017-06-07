import { StateService } from './../../services/state.service';
import { ConfigService } from './../../services/config.service';
import { AuthenticatedHttp } from './../../services/authenticated-http';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'leaderboard',
    templateUrl: './leaderboard.component.html'
})
export class LeaderboardComponent implements OnInit {
    public leaderboard: LeaderboardRow[];

    constructor(private http: AuthenticatedHttp, private configService: ConfigService, private stateService: StateService) {
    }

    ngOnInit(): void {
        this.stateService.startLoading();
        this.http.get(`${this.configService.apiUrl}/api/players/leaderboard`)
            .toPromise()
            .then(resp => {
                this.leaderboard = resp.json() as LeaderboardRow[];
                this.stateService.doneLoading();
            });
    }
}

interface LeaderboardRow {
    nickname: string;
    wins: number;
    losses: number;
}
