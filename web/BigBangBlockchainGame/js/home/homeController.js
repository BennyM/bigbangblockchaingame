(function() {

    var app = angular.module('bigbangblockchain');

    var homeController = function ($scope, $state, $rootScope) {

        $scope.states = {
            busy: 0,
            won: 1,
            draw: 2,
            lost: 3
        };

        $scope.games = [
            {
                id: 'abcdef',
                name: 'Game 1',
                state: $scope.states.won
            },
            {
                id: 'ghijkl',
                name: 'Game 2',
                state: $scope.states.busy
            }
        ];

        $scope.credits = 100;
        $scope.costPerGame = 10;


        $scope.newGame = function() {
            alert('todo: create new game');

            $state.go('game', { gameid: 'zzzzzz' });
        }
        
        var account0 = "0x" + $rootScope.globalKeystore.getAddresses()[0];
        console.log('using account: ' + account0);
        GameLobby.setProvider($rootScope.web3Provider);
        Game.setProvider($rootScope.web3Provider);

        var lobby = GameLobby.at('0x8722e8f18c9a7e9d3c30312095b7bb0826ae3e7b');
        console.log(lobby);
    }

    app.controller('HomeController', ['$scope', '$state', '$rootScope', homeController]);

})();