import { Component } from '@angular/core';
import { Http } from '@angular/http';


@Component({
    selector: 'player-list',
    templateUrl: './player-list.component.html'
})
export class PlayerListComponent {
    public players: Player[];

    constructor(http: Http) {
        console.log('test');
      this.players = [ 
          { name : 'Benny', gamesWon: 3, gamesPlayed : 6 },
          { name : 'Hans', gamesWon: 3, gamesPlayed : 6 }
      ];
    }
}

interface Player {
    name : string,
    gamesWon : number,
    gamesPlayed : number
}
