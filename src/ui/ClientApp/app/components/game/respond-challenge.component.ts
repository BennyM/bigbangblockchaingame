import { GamesService } from './../../services/games.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Hands } from "../../hands";

@Component({
    selector: 'respond-challenge',
    templateUrl: './respond-challenge.component.html'
})
export class RespondChallengeComponent implements OnInit {

    private gameId: number;
    private playerName: string;
    private roundNumber : number;

    constructor(private route: ActivatedRoute, private gamesService: GamesService, private router: Router) {
    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.gameId = parseInt(params['gameid']);
            this.playerName = params['playername'];
            this.roundNumber = parseInt(params['roundNumber']);
        });
    }

    onHandPlayed(hand: Hands) {
        this.gamesService.respondToChallenge(this.gameId, hand, this.roundNumber)
            .then(() => {
                this.router.navigate(['/home'])
            });
    }
}