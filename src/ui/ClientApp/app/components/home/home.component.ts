import { UserService } from './../../services/user.service';
import { GamesService } from './../../services/games.service';
import { Component } from '@angular/core';
import { Game } from '../../services/games.service';

@Component({
    selector: 'home',
    templateUrl: './home.component.html'
})
export class HomeComponent {

    private games: Game[] = new Array<Game>();
    private user: string;

    constructor(gamesService: GamesService, userService: UserService) {
        this.user = userService.currentUser.nickname;
        gamesService.getGamesOfUser()
            .then(games => this.games = games);
    }
}