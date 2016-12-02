(function() {

    var app = angular.module('bigbangblockchain');

    var homeController = function ($scope, $state, $rootScope, gameLogicService, $http) {

        var lobby;
        $scope.account = "0x" + $rootScope.globalKeystore.getAddresses()[0];
        $http.post('/account/RegisterAddress?address=' + $scope.account).then(function (response) { console.log(response); }, function (error) { console.log(error); });
        $scope.inLobby = false;

        console.log('using account: ' + $scope.account);

        //temp ui params
        $scope.states = {busy: 0,won: 1, lost: 2};
        $scope.credits = 100;
        $scope.costPerGame = 10;




        $scope.joinLobby = function () {
            if ($scope.inLobby) {
                $scope.inLobby = false;
            } else {
                lobby.playerInLobby.call($scope.account, { from: $scope.account })
                    .then(function (inLobby) {
                        $scope.$apply(function () {
                            $scope.inLobby = inLobby;
                        });

                        if (!inLobby) {
                            $scope.$apply(function () {
                                $rootScope.loading = true;
                            });
                            return lobby.signup($scope.account, { from: $scope.account, gas: 4000000, gasPrice: 20000000000 });
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
        }

        $scope.newGame = function (versus) {
            var gameStartedEvent = lobby.GameCreated({}, { address: $scope.account });
            gameStartedEvent.watch(function(error, result) {
                console.log(result);
                if (result.args.player1 === $scope.account && result.args.player2 === versus) {
                    $rootScope.loading = false;
                    $state.go('game', { gameid: result.args.game });
                }
            });

            $rootScope.loading = true;
            lobby.startGame($scope.account, versus, { from: $scope.account, gas: 4000000, gasPrice: 20000000000 });

        }
        
        lobby = gameLogicService.getLobby();
        $scope.availablePlayers = gameLogicService.getJoinedPlayers();
        var playerJoinedEvent = lobby.PlayerJoined();
        playerJoinedEvent.watch(function() {
            $scope.$apply(function() {
                $scope.availablePlayers = gameLogicService.getJoinedPlayers();
            });
        });


        function calculateState(winner) {
            if (winner !== '0x0000000000000000000000000000000000000000') {
                if (winner === $scope.account) {
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

            return !alreadyThere && (gameArgs.player1 === $scope.account || gameArgs.player2 === $scope.account);
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
                        newGame.state = result.args.winner === $scope.account ? $scope.states.won : $scope.states.lost;
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
        var gameCreatedEventsPlayer1 = lobby.GameCreated({ player1: $scope.account }, { fromBlock: 0, toBlock: 'latest' });
        var gameCreatedEventsPlayer2 = lobby.GameCreated({ player2: $scope.account }, { fromBlock: 0, toBlock: 'latest' });
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
        var gameCreatedEventPlayer1 = lobby.GameCreated({ player1: $scope.account });
        gameCreatedEventPlayer1.watch(function (error, result) {
            addGame(error, result, true);
        });
        var gameCreatedEventPlayer2 = lobby.GameCreated({ player2: $scope.account });
        gameCreatedEventPlayer2.watch(function (error, result) {
            addGame(error, result, false);
        });

    }

    app.controller('HomeController', ['$scope', '$state', '$rootScope', 'GameLogicService','$http', homeController]);

})();