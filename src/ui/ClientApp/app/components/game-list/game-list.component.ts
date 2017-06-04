import { GamesService } from './../../services/games.service';
import { Component, Output, EventEmitter } from '@angular/core';
import { Hands } from "../../Hands";

@Component({
    selector: 'game-list',
    templateUrl: './game-list.component.html'
})
export class GameListComponent {
    
   constructor(public gamesService : GamesService){

   }
}


