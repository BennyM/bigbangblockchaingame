(function() {

    var app = angular.module('bigbangblockchain');

    var homeController = function ($scope, $state) {

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
    }

    app.controller('HomeController', ['$scope', '$state', homeController]);

})();