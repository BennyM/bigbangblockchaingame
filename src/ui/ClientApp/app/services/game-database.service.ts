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
            objectStore.createIndex("address", "address", { unique: false });
        });
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

    updateGameAddress(id : number, address : string) : Promise<any>{
        return this.db.getByKey('games',id)
            .then((item : GameData) =>{
                if(item != null && item.address != address){
                    item.address = address;
                   return this.db.update('games', item);
                } else{
                    var data = new GameData(id);
                    data.address = address;
                    return this.db.add('games', data);
                }
            });
    }

    findHand(address : string) : Promise<GameHand>{
        return this.db.getByIndex('games', 'address', address)
            .then((game : GameData) =>  game.hands[game.hands.length - 1]);
    }
}

export class GameData{

    public address : string;
    public hands : GameHand[];

    constructor(public id : number){
        this.hands = [];
    }
    
  
}

export class GameHand{


    constructor(public round : number, public hand : Hands, public salt : string, public revealed : boolean = false){
       
    }
}