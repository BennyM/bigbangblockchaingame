import { StateService } from './state.service';
import { ConfigService } from './config.service';
import { Router } from '@angular/router';
import { AuthenticatedHttp, createAuthedOptions } from './authenticated-http';
import { WalletService } from './wallet.service';
import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions } from "@angular/http";

import 'rxjs/add/operator/toPromise';

@Injectable()
export class UserService {
    
    private localStorageKey = "currentuser";
    private addUserUrl;
    private initAccountUrl;
    private requestOptions = new RequestOptions({headers: new Headers({'Content-Type': 'application/json'})});

    currentUser: User;
        
    constructor(private http: Http, private walletService : WalletService, private router: Router, configService: ConfigService, private stateService: StateService) {
        this.addUserUrl = `${configService.apiUrl}/api/players`;
        this.initAccountUrl = `${configService.apiUrl}/api/accounts`;

        if(typeof window !== 'undefined'){
            this.currentUser = JSON.parse(localStorage.getItem(this.localStorageKey));
            if(this.currentUser){
                walletService.getOrCreateVault(this.currentUser.lousySecurityKey);
            } else {
                this.router.navigate(['/register']);
            }
        }
    }

    createNewUser(nickname: string): Promise<void> {
        this.stateService.startLoading();
        return this.http.post(this.addUserUrl, JSON.stringify({nickname: nickname}), this.requestOptions)
            .toPromise()
            .then(response => {
                this.currentUser = new User();
                this.currentUser.nickname = nickname;
                this.currentUser.lousySecurityKey = response.json();
                if(typeof window !== 'undefined') {
                    localStorage.setItem(this.localStorageKey, JSON.stringify(this.currentUser));
                }
            })
            .then(() =>{ 
                return this.walletService.getOrCreateVault(this.currentUser.lousySecurityKey);
            })
            .then(ks => {
                var address = ks.getAddresses()[0];
                var options = createAuthedOptions(this.currentUser.lousySecurityKey);
                this.requestOptions.headers.append('Authorization', options.headers.get('Authorization'));
                return this.http.post(this.initAccountUrl, JSON.stringify({address: address}), this.requestOptions).toPromise();
            })
            .then(() => {
                this.stateService.doneLoading();
                console.log('done');
            });
    }
}

export class User {
    nickname: string;
    lousySecurityKey: string;
}