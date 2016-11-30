(function() {

    var app = angular.module('bigbangblockchain');

    var gameLogicService = function($rootScope, $q, $timeout) {

        function initializeGame() {
            $rootScope.loading = true;

            var promise = $q(function (resolve, reject) {
                var globalKeystore;
                var web3Provider;

                var serializedKeystore = localStorage.getItem('keystore');

                if (serializedKeystore) {
                    globalKeystore = lightwallet.keystore.deserialize(serializedKeystore);
                    globalKeystore.passwordProvider = function (callback) {
                        callback(null, 'password');
                    };
                    web3Provider = new HookedWeb3Provider({
                        host: 'http://clbrewaji.westeurope.cloudapp.azure.com:8545',
                        transaction_signer: globalKeystore
                    });
                    ready();
                } else {

                    lightwallet.keystore.createVault({
                        password: 'password'
                    }, function (err, ks) {
                        console.log('this is the keystore');
                        console.log(ks);
                        if (ks) {
                            ks.passwordProvider = function (callback) {
                                callback(null, 'password');
                            };
                            globalKeystore = ks;
                            web3Provider = new HookedWeb3Provider({
                                host: 'http://clbrewaji.westeurope.cloudapp.azure.com:8545',
                                transaction_signer: ks
                            });
                            ks.keyFromPassword('password', function (err, pwDerivedKey) {
                                if (err) throw err;

                                ks.generateNewAddress(pwDerivedKey, 1);
                                var addr = ks.getAddresses();
                                console.log('addresses:');
                                console.log(addr);
                                console.log(addr[0]);

                                var serializedKs = ks.serialize();
                                localStorage.setItem('keystore', serializedKs);

                                ready();
                            });
                        }
                    });
                }

                function ready() {
                    $rootScope.globalKeystore = globalKeystore;
                    $rootScope.web3Provider = web3Provider;

                    $rootScope.loading = false;
                    resolve();
                }
            });

            return promise;
        }

        return {
            initializeGame: initializeGame
        }
    }

    app.factory('GameLogicService', ['$rootScope', '$q', '$timeout', gameLogicService]);

})();