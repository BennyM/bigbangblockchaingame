import { AuthenticatedHttp, createAuthedOptions } from './authenticated-http';
import { WalletService } from './wallet.service';
import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions } from "@angular/http";

import 'rxjs/add/operator/toPromise';

@Injectable()
export class UserService {
    
    private localStorageKey = "currentuser";
    private addUserUrl = 'http://localhost:5000/api/players'; // todo fix urls
    private initAccountUrl = 'http://localhost:5000/api/accounts'; // todo fix urls
    private requestOptions = new RequestOptions({headers: new Headers({'Content-Type': 'application/json'})});

    currentUser: User;
        
    constructor(
        private http: Http,
        private walletService : WalletService) {
        if(typeof window !== 'undefined'){
            this.currentUser = JSON.parse(localStorage.getItem(this.localStorageKey));
            if(this.currentUser){
                walletService.getOrCreateVault(this.currentUser.lousySecurityKey);
            }
        }
    }

    createNewUser(email: string, nickname: string): Promise<void> {
        return this.http.post(this.addUserUrl, JSON.stringify({email: email, nickname: nickname}), this.requestOptions)
            .toPromise()
            .then(response => {
                this.currentUser = new User();
                this.currentUser.email = email;
                this.currentUser.nickname = nickname;
                this.currentUser.lousySecurityKey = response.json();
                if(typeof window !== 'undefined') {
                    localStorage.setItem(this.localStorageKey, JSON.stringify(this.currentUser));
                }
            })
            .then( () =>{ 
                return this.walletService.getOrCreateVault(this.currentUser.lousySecurityKey)
            })
            .then(ks => {
                var address = ks.getAddresses()[0];
                var options = createAuthedOptions(this.currentUser.lousySecurityKey);
                this.requestOptions.headers.append('Authorization', options.headers.get('Authorization'));
                return this.http.post(this.initAccountUrl, JSON.stringify({address: address}), this.requestOptions).toPromise();
            })
            .then(() => {});;
    }
}

export class User {
    email: string;
    nickname: string;
    lousySecurityKey: string;
}