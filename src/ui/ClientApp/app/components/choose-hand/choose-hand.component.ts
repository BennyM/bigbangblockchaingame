import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Hands } from "../../Hands";


@Component({
    selector: 'choose-hand',
    templateUrl: './choose-hand.component.html'
})
export class ChooseHandComponent {
    
    public availableHands = Hands;

    constructor(http: Http) {
       
    }

    playHand(hand : Hands){
        console.log(hand);
    }
}