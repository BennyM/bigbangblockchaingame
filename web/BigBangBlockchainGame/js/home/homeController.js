(function() {

    var app = angular.module('bigbangblockchain');

    var homeController = function ($scope, $state, $rootScope) {

        var lobby;
        var account = "0x" + $rootScope.globalKeystore.getAddresses()[0];
        $scope.inLobby = false;

        console.log('using account: ' + account);

        //temp ui params
        $scope.states = {busy: 0,won: 1, lost: 2};
        $scope.credits = 100;
        $scope.costPerGame = 10;




        $scope.joinLobby = function () {
            lobby.playerInLobby.call(account, { from: account })
                .then(function (inLobby) {
                    $scope.$apply(function() {
                        $scope.inLobby = inLobby;
                    
                        if (!inLobby) {
                            $rootScope.loading = true;
                            lobby.signup(account, { from: account, gas: 4000000, gasPrice: 20000000000 })
                                .then(function () {
                                    $scope.$apply(function () {
                                        $scope.inLobby = true;
                                        $rootScope.loading = false;
                                    });
                                });
                        }
                    });
                });

        }

        $scope.newGame = function (versus) {
            var gameStartedEvent = lobby.GameCreated({}, { address: account });
            gameStartedEvent.watch(function(error, result) {
                console.log(result);
                if (result.args.player1 === account && result.args.player2 === versus) {
                    $rootScope.loading = false;
                    $state.go('game', { gameid: result.args.game });
                }
            });

            $rootScope.loading = true;
            lobby.startGame(account, versus, { from: account, gas: 4000000, gasPrice: 20000000000 });

        }
        
        GameLobby.setProvider($rootScope.web3Provider);

        //$rootScope.loading = true;
        //GameLobby.new({ from: account, gas: 4000000, gasPrice: 20000000000 })
        //    .then(function(instance) {
        //        lobby = GameLobby.at(instance.address);
        //        lobby.openLobby({ from: account, gas: 4000000, gasPrice: 20000000000 })
        //            .then(function() {
        //                console.log('lobby available at :' + instance.address);
        //                $rootScope.loading = false;
        //            });
        //    });
        
        lobby = GameLobby.at('0xed58bf3bc12daee41408f2ae9d465c8379329443');
        
        function playerToBeAdded(player) {
            var alreadyThere = false;
            $scope.availablePlayers.forEach(function(p) {
                if (p.id === player) {
                    alreadyThere = true;
                }
            });

            return player !== account && !alreadyThere;
        }
        function addPlayer(error, result) {
            if (playerToBeAdded(result.args.player)) {
                $scope.availablePlayers.push({
                    id: result.args.player,
                    name: 'Player ' + result.args.player
                });
            }
        }

        $scope.availablePlayers =[];
        var playerJoinedEvent = lobby.PlayerJoined({}, { fromBlock: 0, toBlock: 'latest' });
        playerJoinedEvent.get(function (error, result) {
            result.forEach(function (e) {
                addPlayer(error, e);
            });
        });
        playerJoinedEvent.watch(addPlayer);



        function calculateState(winner) {
            if (winner !== '0x0000000000000000000000000000000000000000') {
                if (winner === account) {
                    return $scope.states.won;
                } else {
                    return $scope.states.lost;
                }
            } else {
                return $scope.states.busy;
            }
        }
        function gameToBeAdded(game) {
            var alreadyThere = false;
            $scope.games.forEach(function(g) {
                if (g.id === game) {
                    alreadyThere = true;
                }
            });

            return !alreadyThere;
        }
        function addGame(error, result, isPlayer1) {
            if (gameToBeAdded(result.args.game)) {
                var versus = isPlayer1 ? result.args.player2 : result.args.player1;
                var newGame = {
                    id: result.args.game,
                    name: 'Game against ' + versus
                };

                $scope.$apply(function() {
                    $scope.games.push(newGame);
                });

                var game = Game.at(result.args.game);
                game.winner()
                    .then(function(winner) {
                        $scope.$apply(function () {
                            newGame.state = calculateState(winner);
                        });
                    });
                var winnerEvent = game.Winner();
                winnerEvent.watch(function (error, result) {
                    $scope.$apply(function() {
                        newGame.state = result.args.winner === account ? $scope.states.won : $scope.states.lost;
                    });
                });
            }
        }

        $scope.games = [];
        var gameCreatedEventPlayer1 = lobby.GameCreated({ player1: account }, { fromBlock: 0, toBlock: 'latest' });
        var gameCreatedEventPlayer2 = lobby.GameCreated({ player2: account }, { fromBlock: 0, toBlock: 'latest' });
        gameCreatedEventPlayer1.get(function(error, result) {
            result.forEach(function(e) {
                addGame(error, e, true);
            });
        });
        gameCreatedEventPlayer2.get(function (error, result) {
            result.forEach(function (e) {
                addGame(error, e, false);
            });
        });
        gameCreatedEventPlayer1.watch(function (error, result) {
            addGame(error, result, true);
        });
        gameCreatedEventPlayer2.watch(function (error, result) {
            addGame(error, result, false);
        });

    }

    app.controller('HomeController', ['$scope', '$state', '$rootScope', homeController]);

})();