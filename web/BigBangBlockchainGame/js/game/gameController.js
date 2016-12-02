(function() {

    var app = angular.module('bigbangblockchain');

    var gameController = function ($scope, $stateParams, $rootScope, $http) {

        $scope.handState = { none: 0, rock: 1, paper: 2, scissors: 3, lizard: 4, spock: 5 };
        
        $scope.account = "0x" + $rootScope.globalKeystore.getAddresses()[0];
        console.log('using account: ' + $scope.account);
        $http.post('/account/RegisterAddress?address=' + $scope.account).then(function (response) { console.log(response); }, function (error) { console.log(error); });

        Game.setProvider($rootScope.web3Provider);
        var game = Game.at($stateParams.gameid);

        $scope.playedHand = $scope.handState.none;
        $scope.otherPlayerPlayedHand = $scope.handState.none;
        $scope.winner = '0x0000000000000000000000000000000000000000';
        
        $scope.playHand = function (hand) {
            game.playHand(hand, { from: $scope.account, gas: 4000000, gasPrice: 20000000000 })
                .then(function () {
                    $scope.$apply(function() {
                        $scope.playedHand = parseInt(hand);
                    });
                });
            $scope.playedHand = parseInt(hand);
        }

        function initialize() {

            var gameWinEvent = game.Winner();
            gameWinEvent.watch(function(error, result) {
                if (!error) {
                    $scope.$apply(function() {
                        $scope.winner = result.args.winner;
                        if ($scope.winner === $scope.account) {
                            $scope.playedHand = parseInt(result.args.winnerState);
                            $scope.otherPlayerPlayedHand = parseInt(result.args.loserState);
                        } else {
                            $scope.playedHand = parseInt(result.args.loserState);
                            $scope.otherPlayerPlayedHand = parseInt(result.args.winnerState);
                        }
                    });
                }
            });

            game.player1()
                .then(function (player1) {
                    $scope.$apply(function () {
                        $scope.player1 = player1;
                        $scope.isPlayer1 = $scope.player1 === $scope.account;
                    });
                })
                .then(function () {
                    return $scope.isPlayer1 ? game.lastPlayedHand1() : game.lastPlayedHand2();
                })
                .then(function (lastPlayedHand) {
                    $scope.$apply(function () {
                        $scope.playedHand = parseInt(lastPlayedHand);
                    });
                });

            game.player2().then(function (player2) {
                $scope.$apply(function () {
                    $scope.player2 = player2;
                });
            });

            game.winner()
                .then(function (winner) {
                    $scope.$apply(function() {
                        $scope.winner = winner;
                    });
                    if (winner !== '0x0000000000000000000000000000000000000000') {
                        return $scope.isPlayer1 ? game.lastPlayedHand2() : game.lastPlayedHand1();
                    } else {
                        return null;
                    }
                })
                .then(function (lastPlayedHand) {
                    if (lastPlayedHand) {
                        $scope.$apply(function () {
                            $scope.otherPlayerPlayedHand = parseInt(lastPlayedHand);
                        });
                    }
                });

        }

        initialize();

    }

    app.controller('GameController', ['$scope', '$stateParams', '$rootScope', gameController]);

})();