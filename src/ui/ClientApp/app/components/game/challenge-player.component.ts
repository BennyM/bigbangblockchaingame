import { PlayedHand } from './../choose-hand/choose-hand.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

@Component({
    selector: 'challenge-player',
    templateUrl: './challenge-player.component.html'
})
export class ChallengePlayerComponent implements OnInit {

    private playerId: string;
    private playerName: string;

    constructor(private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.playerId = params['playerid'];
            this.playerName = params['playername'];
        });
    }

    onHandSelected(playedHand : PlayedHand): void{
        console.log(playedHand);
    }

}