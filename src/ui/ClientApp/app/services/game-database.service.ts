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
        return this.db.add('games', data);
    }

    updateGameAddress(id : number, address : string) : Promise<any>{
        return this.db.update('games', { id: id, address: address })
    }

    findHand(address : string) : Promise<HandCorrelationData>{
        return this.db.getByIndex('games', 'address', address);
    }
}

export class HandCorrelationData{

    constructor(public hand : Hands, public id : Number, public salt : string){

    }
}