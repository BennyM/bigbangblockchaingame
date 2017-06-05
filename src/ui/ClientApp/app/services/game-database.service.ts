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

    storeHand(data : HandCorrelationData) : Promise<any>{
        return this.db.getByKey('games',data.id)
            .then((item : HandCorrelationData) =>{
                if(item != null){
                    item.hand = data.hand;
                    item.salt = data.salt;
                   return this.db.update('games', item);
                } else{
                    return this.db.add('games', data);
                }
            });
    }

    updateGameAddress(id : number, address : string) : Promise<any>{
        return this.db.getByKey('games',id)
            .then((item : HandCorrelationData) =>{
                if(item != null){
                    item.address = address;
                   return this.db.update('games', item);
                } else{
                    var data = new HandCorrelationData(Hands.none, id, null);
                    data.address = address;
                    return this.db.add('games', data);
                }
            });
    }

    findHand(address : string) : Promise<HandCorrelationData>{
        return this.db.getByIndex('games', 'address', address);
    }
}

export class HandCorrelationData{

    public address : string;
    constructor(public hand : Hands, public id : number, public salt : string){

    }
}