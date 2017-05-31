import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions } from "@angular/http";

import 'rxjs/add/operator/toPromise';

@Injectable()
export class UserService {
    
    private localStorageKey = "currentuser";
    private addUserUrl = 'http://localhost:5000/api/players' // todo fix urls
    private requestOptions = new RequestOptions({headers: new Headers({'Content-Type': 'application/json'})});

    currentUser: User;
        
    constructor(private http: Http) {
        if(typeof window !== 'undefined'){
            this.currentUser = JSON.parse(localStorage.getItem(this.localStorageKey));
        }
    }

    createNewUser(email: string, nickname: string): Promise<void> {
        return this.http.post(this.addUserUrl, JSON.stringify({email: email, nickname: nickname}), this.requestOptions)
            .toPromise()
            .then(response => {
                this.currentUser = new User();
                this.currentUser.email = email;
                this.currentUser.nickname = nickname;
                this.currentUser.lousySecurityKey = response.text();

                if(typeof window !== 'undefined') {
                    localStorage.setItem(this.localStorageKey, JSON.stringify(this.currentUser));
                }
            });
    }
}

export class User {
    email: string;
    nickname: string;
    lousySecurityKey: string;
}