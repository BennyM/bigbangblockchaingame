import { UserService } from './../../services/user.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'home',
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

    private user: string;

    constructor(private userService: UserService) {
    }

    ngOnInit(): void {
        this.user = this.userService.currentUser.nickname;        
    }
}