import { Component, Output, EventEmitter } from '@angular/core';
import { Hands } from "../../Hands";
import * as randomstring from 'randomstring';
import * as abi from 'ethereumjs-abi';

@Component({
    selector: 'choose-hand',
    templateUrl: './choose-hand.component.html'
})
export class ChooseHandComponent {

    public availableHands = Hands;
    @Output() onHandPlayed = new EventEmitter<PlayedHand>();

    playHand(hand: Hands) {
        let salt = randomstring.generate(7);
        let hashed =  "0x" + abi.soliditySHA3(
            [  "uint8", "string" ],
            [ 1, salt]).toString('hex');
        this.onHandPlayed.emit(new PlayedHand(hand,salt,hashed));

    }
}

export class PlayedHand {

    constructor(
        public hand: Hands,
        public salt: string,
        public hashedValue: string) {

    }
}