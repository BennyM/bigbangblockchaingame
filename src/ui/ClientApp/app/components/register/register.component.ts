import { WalletService } from './../../services/wallet.service';
import { UserService } from './../../services/user.service';
import { Component, enableProdMode } from '@angular/core';
import { Router } from "@angular/router";

@Component({
    selector: 'register',
    templateUrl: './register.component.html'
})
export class RegisterComponent {

    private newUser: RegisterUser;

    constructor(private userService: UserService, private router: Router) {
        this.newUser = new RegisterUser();
    }

    addPlayer(): void {
        this.userService.createNewUser(this.newUser.email, this.newUser.nickname)
            .then(() => {
                this.router.navigate(['/home']);
            });
    }
}

export class RegisterUser {
    email: string;
    nickname: string;
}