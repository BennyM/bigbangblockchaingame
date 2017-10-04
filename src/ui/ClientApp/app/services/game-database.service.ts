import { Game } from './games.service';
import { Injectable } from '@angular/core';
import { HandConfirmationService } from './hand-confirmation.service';
import { AngularIndexedDB } from 'angular2-indexeddb';
import { Hands } from "../hands";

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
        return this.db.getByKey('games',id)
            .then((game: GameDto) => {
                return new GameData(game);
            });
    }

    storeGame(data : GameData ) : Promise<GameData>{
         return this.db.update('games', data.game)
            .then((game: GameDto) => {
                return new GameData(game);
            });
    }

    storeHand(data : GameHand, gameId : number) : Promise<any>{
        return this.db.getByKey('games',gameId)
            .then((game: GameDto) => {
                if(game) {
                    return new GameData(game);
                }
                return null;
            })
            .then((item : GameData) =>{
                if(item != null){
                    item.game.hands.push(data);
                   return this.db.update('games', item.game);
                } else{
                    let gameData = new GameData(new GameDto(gameId));
                    gameData.game.hands.push(data);
                    return this.db.add('games', gameData.game);
                }
            });
    }
}

export class GameData{

    constructor(public game: GameDto){
        
    }
    
    public lastRound() : GameHand{
        let roundNumbers = this.game.hands.map(item => item.round);
        if(roundNumbers && roundNumbers.length > 0){
            let lastRoundNumber = Math.max.apply(null, roundNumbers);
            return this.game.hands.find(x => x.round == lastRoundNumber);
        }
        return null;
    }
}

export class GameDto {
    public hands : GameHand[];

    constructor(public id: number) {
        this.hands = [];
    }
}

export class GameHand{

    constructor(public round : number, public hand : Hands, public salt : string, public revealed : boolean = false, public startedReveal : Date = null){
       
    }

}