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
                    });

                    if (!inLobby) {
                        $scope.$apply(function() {
                            $rootScope.loading = true;
                        });
                        return lobby.signup(account, { from: account, gas: 4000000, gasPrice: 20000000000 });
                    } else {
                        return null;
                    }
                })
                .then(function () {
                    $scope.$apply(function () {
                        $scope.inLobby = true;
                        $rootScope.loading = false;
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
                $scope.$apply(function() {
                    $scope.availablePlayers.push({
                        id: result.args.player,
                        name: 'Player ' + result.args.player
                    });
                });
            }
        }

        $scope.availablePlayers =[];
        var playerJoinedEvents = lobby.PlayerJoined({}, { fromBlock: 0, toBlock: 'latest' });
        playerJoinedEvents.get(function (error, result) {
            result.forEach(function (e) {
                addPlayer(error, e);
            });
        });
        var playerJoinedEvent = lobby.PlayerJoined();
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
        function gameToBeAdded(gameArgs) {
            var alreadyThere = false;
            $scope.games.forEach(function(g) {
                if (g.id === gameArgs.game) {
                    alreadyThere = true;
                }
            });

            return !alreadyThere && (gameArgs.player1 === account || gameArgs.player2 === account);
        }
        function addGame(error, result, isPlayer1) {
            if (gameToBeAdded(result.args)) {
                var versus = isPlayer1 ? result.args.player2 : result.args.player1;
                var newGame = {
                    id: result.args.game,
                    name: 'Game against ' + versus,
                    draws: 0
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
                var drawEvents = game.Draw({}, { fromBlock: 0, toBlock: 'latest' });
                drawEvents.get(function (error, result) {
                    $scope.$apply(function () {
                        newGame.draws = result.length;
                    });
                });
                var drawEvent = game.Draw();
                drawEvent.watch(function(error, result) {
                    $scope.$apply(function() {
                        newGame.draws++;
                    });
                });
                
            }
        }

        $scope.games = [];
        var gameCreatedEventsPlayer1 = lobby.GameCreated({ player1: account }, { fromBlock: 0, toBlock: 'latest' });
        var gameCreatedEventsPlayer2 = lobby.GameCreated({ player2: account }, { fromBlock: 0, toBlock: 'latest' });
        gameCreatedEventsPlayer1.get(function(error, result) {
            result.forEach(function(e) {
                addGame(error, e, true);
            });
        });
        gameCreatedEventsPlayer2.get(function (error, result) {
            result.forEach(function (e) {
                addGame(error, e, false);
            });
        });
        var gameCreatedEventPlayer1 = lobby.GameCreated({ player1: account });
        gameCreatedEventPlayer1.watch(function (error, result) {
            addGame(error, result, true);
        });
        var gameCreatedEventPlayer2 = lobby.GameCreated({ player2: account });
        gameCreatedEventPlayer2.watch(function (error, result) {
            addGame(error, result, false);
        });

    }

    app.controller('HomeController', ['$scope', '$state', '$rootScope', homeController]);

})();