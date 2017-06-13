import { Game } from './games.service';
import { Injectable } from '@angular/core';
import { HandConfirmationService } from './hand-confirmation.service';
import { AngularIndexedDB } from 'angular2-indexeddb';
import { Hands } from "../Hands";

@Injectable()
export class GameDatabaseService{
    private db: AngularIndexedDB;
    
    constructor(){
         this.db = new AngularIndexedDB('bbbgdb', 1);
        this.db.createStore(1, (evt) => {
            let objectStore = evt.currentTarget.result.createObjectStore(
                'games', { keyPath: "id", autoIncrement: false });
        });
    }

    findGameById(id : number) : Promise<GameData>{
        return this.db.getByKey('games',id);
    }

    storeGame(data : GameData ) : Promise<GameData>{
         return this.db.update('games', data);
    }

    storeHand(data : GameHand, gameId : number) : Promise<any>{
        return this.db.getByKey('games',gameId)
            .then((item : GameData) =>{
                if(item != null){
                    item.hands.push(data);
                   return this.db.update('games', item);
                } else{
                    let game = new GameData(gameId);
                    game.hands.push(data);
                    return this.db.add('games', game);
                }
            });
    }
}

export class GameData{

    public hands : GameHand[];

    constructor(public id : number){
        this.hands = [];
    }
    
    public lastRound() : GameHand{
        let roundNumbers = this.hands.map(item => item.round);
        if(roundNumbers && roundNumbers.length > 0){
            let lastRoundNumber = Math.max.apply(null, roundNumbers);
            return this.hands.find(x => x.round == lastRoundNumber);
        }
        return null;
    }
}

export class GameHand{

    constructor(public round : number, public hand : Hands, public salt : string, public revealed : boolean = false, public startedReveal : Date = null){
       
    }

}