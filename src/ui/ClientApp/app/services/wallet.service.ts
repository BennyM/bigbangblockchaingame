import { Injectable } from '@angular/core';
import * as Web3 from 'web3';
import { keystore } from 'eth-lightwallet';
import * as Web3ProviderEngine from 'web3-provider-engine';
import * as RpcSource from 'web3-provider-engine/subproviders/rpc';
import * as HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet';

@Injectable()
export class WalletService {

    private superSecurePassword: string = 'password';

    getOrCreateVault(): any {
        let ks;
        if (typeof window !== "undefined") {
            let serializedKeystore = localStorage.getItem('keystore');

            if (serializedKeystore) {
                ks = keystore.deserialize(serializedKeystore);
                ks.passwordProvider =  (callback) =>{
                    callback(null, this.superSecurePassword);
                };
            } else {
                keystore.createVault({
                    password: this.superSecurePassword
                }, (err, newStore) => {
                    if (newStore) {
                        ks = newStore;
                        ks.passwordProvider = (callback) => {
                            callback(null, this.superSecurePassword);
                        };
                        ks.keyFromPassword(this.superSecurePassword, (err, pwDerivedKey) => {
                            if (err) throw err;

                            ks.generateNewAddress(pwDerivedKey, 1);
                            var addr = ks.getAddresses();

                            var serializedKs = ks.serialize();
                            localStorage.setItem('keystore', serializedKs);


                        });
                    }
                });
            }
            return ks;
        }

    }

    constructor() {

    }
}