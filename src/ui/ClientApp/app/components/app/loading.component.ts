import { StateService } from './../../services/state.service';
import { Component } from '@angular/core';

@Component({
    selector: 'loading',
    templateUrl: './loading.component.html',
    styles: ['@media(max-width:767px) { .theloader{padding-top:50px;display:block;}}', '.progress{height:10px;margin:0;}']
})
export class LoadingComponent {
    constructor(private stateService: StateService) {
    }
}