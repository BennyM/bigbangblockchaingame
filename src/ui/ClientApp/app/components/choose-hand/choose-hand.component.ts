import { Component, Output, EventEmitter } from '@angular/core';
import { Hands } from "../../hands";

@Component({
    selector: 'choose-hand',
    templateUrl: './choose-hand.component.html'
})
export class ChooseHandComponent {
    
    private availableHands = Hands;

    @Output() handPlayed = new EventEmitter<Hands>();

    playHand(hand: Hands){
        this.handPlayed.emit(hand);
    }
}