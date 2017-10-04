import { GamesService } from './../../services/games.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Hands } from "../../hands";

@Component({
    selector: 'challenge-player',
    templateUrl: './challenge-player.component.html'
})
export class ChallengePlayerComponent implements OnInit {

    private playerId: string;
    private playerName: string;

    constructor(private route: ActivatedRoute, private gamesService: GamesService, private router: Router) {
    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.playerId = params['playerid'];
            this.playerName = params['playername'];
        });
    }

    onHandPlayed(hand: Hands) {
        this.gamesService.challengeOpponent(this.playerId, hand)
            .then(() => {
                this.router.navigate(['/home'])
            });
    }
}