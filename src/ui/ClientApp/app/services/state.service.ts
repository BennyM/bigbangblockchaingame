import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';

@Injectable()
export class StateService{
    private loading: boolean;

    constructor() {
    }

    startLoading(): void {
        this.loading = true;
    }

    doneLoading(): void {
        this.loading = false;
    }
}