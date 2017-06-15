import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {
    apiUrl: string;

    constructor() {
        if(typeof window !== 'undefined') {
            if(window.location.hostname == 'localhost') {
                this.apiUrl = 'http://localhost:5000'
            } else {
                this.apiUrl = 'http://bbbgapi.azurewebsites.net'
            }
        }
    }
}