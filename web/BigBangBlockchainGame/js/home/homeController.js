(function() {

    var app = angular.module('bigbangblockchain');

    var homeController = function ($scope, $state, $rootScope) {

        var lobby;
        var account = "0x" + $rootScope.globalKeystore.getAddresses()[0];
        $scope.inLobby = false;

        console.log('using account: ' + account);

        //temp ui params
        $scope.states = {busy: 0,won: 1,draw: 2,lost: 3};
        $scope.games = [{id: 'abcdef',name: 'Game 1',state: $scope.states.won},{id: 'ghijkl',name: 'Game 2',state: $scope.states.busy}];
        $scope.credits = 100;
        $scope.costPerGame = 10;




        $scope.joinLobby = function () {
            $rootScope.loading = true;
            lobby.signup(account, { from: account, gas: 4000000, gasPrice: 20000000000 })
                .then(function () {
                    $scope.$apply(function() {
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
        //        console.log('lobby available at :' + instance.address);
                
        //        lobby.openLobby({ from: account, gas: 4000000, gasPrice: 20000000000 });

        //        $rootScope.loading = false;
        //    });
        
        lobby = GameLobby.at('0x6875bc3bc35ca49d36a9f6fc472311a6bc3471c5');
        console.log(lobby);

        //lobby.gamesOfUser.call(account, { from: account })
        //    .then(function(games) {
        //        console.log(games);
        //    });

        lobby.availablePlayers()
            .then(function (availablePlayers) {
                $scope.$apply(function () {
                    $scope.availablePlayers = [];

                    availablePlayers.forEach(function (p) {
                        if (p !== account) {
                            $scope.availablePlayers.push({
                                id: p,
                                name: 'Player ' + p
                            });
                        }
                    });
                });
            });
        
    }

    app.controller('HomeController', ['$scope', '$state', '$rootScope', homeController]);

})();