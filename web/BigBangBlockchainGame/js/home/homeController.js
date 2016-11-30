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

        lobby = GameLobby.at('0x8722e8f18c9a7e9d3c30312095b7bb0826ae3e7b');
        console.log(lobby);

        //todo fetch from GameLobby (private at this moment)
        $scope.availablePlayers = [
            {
                id: '0xdbd1f299022f5e66b5c80e055bdee7e9aa4635cd',
                name: 'Benny Michielsen'
            }
        ];
    }

    app.controller('HomeController', ['$scope', '$state', '$rootScope', homeController]);

})();