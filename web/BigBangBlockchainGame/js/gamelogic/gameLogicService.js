(function() {

    var app = angular.module('bigbangblockchain');

    var gameLogicService = function($rootScope, $q, $timeout) {

        var joinedPlayers = [];
        var lobby;
        var account;
        var you;


        function playerToBeAdded(player) {
            var alreadyThere = false;
            joinedPlayers.forEach(function (p) {
                if (p.id === player) {
                    alreadyThere = true;
                }
            });

            return player !== account && !alreadyThere;
        }
        function addPlayer(error, result) {
            if (playerToBeAdded(result.args.player)) {
                joinedPlayers.push({
                    id: result.args.player,
                    name: 'Player ' + result.args.player
                });
            }
        }
        
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
                        host: $('#blockchainurl').data('blockchainurl'),
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
                                host: $('#blockchainurl').data('blockchainurl'),
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
                    account = "0x" + $rootScope.globalKeystore.getAddresses()[0];
                    you = {
                        id: account,
                        name: 'You'
                    };

                    GameLobby.setProvider($rootScope.web3Provider);
                    HighScore.setProvider($rootScope.web3Provider);


                    //$rootScope.loading = true;
                    //GameLobby.new({ from: account, gas: 4000000, gasPrice: 20000000000 })
                    //    .then(function(instance) {
                    //        lobby = GameLobby.at(instance.address);
                    //        lobby.openLobby({ from: account, gas: 4000000, gasPrice: 20000000000 })
                    //            .then(function() {
                    //                console.log('lobby available at: ' + instance.address);
                    //                $rootScope.loading = false;
                    //            });
                    //    });
                    //GameLobby.new({ from: account, gas: 4000000, gasPrice: 20000000000 }).then(function(instance) {lobby = GameLobby.at(instance.address);lobby.openLobby({ from: account, gas: 4000000, gasPrice: 20000000000 }).then(function() {console.log('lobby available at: ' + instance.address);});});

                    //lobby = GameLobby.at('0xed58bf3bc12daee41408f2ae9d465c8379329443');
                    lobby = GameLobby.at($('#gamelobbyaddress').data('gamelobbyaddress'));
                    
                    var playerJoinedEvents = lobby.PlayerJoined({}, { fromBlock: 0, toBlock: 'latest' });
                    playerJoinedEvents.get(function (error, result) {
                        result.forEach(function (e) {
                            addPlayer(error, e);
                        });
                        var playerJoinedEvent = lobby.PlayerJoined();
                        playerJoinedEvent.watch(addPlayer);
                        $rootScope.loading = false;
                        resolve();
                    });
                }
            });



            return promise;
        }

        return {
            initializeGame: initializeGame,
            getLobby: function () { return lobby; },
            getJoinedPlayers: function() {
                return joinedPlayers;
            },
            getYou: function () { return you; }
        }
    }

    app.factory('GameLogicService', ['$rootScope', '$q', '$timeout', gameLogicService]);

})();