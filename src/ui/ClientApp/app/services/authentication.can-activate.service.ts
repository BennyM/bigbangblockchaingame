import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from "rxjs/Observable";
import { UserService } from "./user.service";

@Injectable()
export class AuthenticationCanActivateService implements CanActivate {
    
    constructor(private userService: UserService, private router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
        if(this.userService.currentUser != null) {
            return true;
        }
        this.router.navigate(['/register']);
    }
}
