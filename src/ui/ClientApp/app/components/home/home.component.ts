import { UserService } from './../../services/user.service';
import { GamesService } from './../../services/games.service';
import { Component, OnInit } from '@angular/core';
import { Game } from '../../services/games.service';

@Component({
    selector: 'home',
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

    private user: string;

    constructor(private gamesService: GamesService, private userService: UserService) {
    }

    ngOnInit(): void {
        this.user = this.userService.currentUser.nickname;
        
    }
}