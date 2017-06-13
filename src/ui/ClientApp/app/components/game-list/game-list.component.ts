import { Observable } from 'rxjs/Observable';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { Router } from '@angular/router';
import { GamesService, Game } from './../../services/games.service';
import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Hands } from "../../Hands";
import { Subscription } from "rxjs/Subscription";

@Component({
    selector: 'game-list',
    templateUrl: './game-list.component.html'
})
export class GameListComponent implements OnInit, OnDestroy {
    
    private gamesSubscription: Subscription;
    private games: Game[];

    constructor(private gamesService : GamesService, private router: Router){
    }

    ngOnInit(): void {
        this.gamesSubscription = this.gamesService.gamesOfUser
            .subscribe(value => this.games = value);
    }

    ngOnDestroy(): void {
        this.gamesSubscription.unsubscribe();
    }

    onRespondClick(game: Game): void {
        this.router.navigate(['/respond-challenge', game.id, game.opponentName, game.currentRound]);
    }
}


