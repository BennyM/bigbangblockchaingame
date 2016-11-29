(function() {

    var app = angular.module('bigbangblockchain');

    var leaderboardController = function($scope) {
        $scope.leaderboard = [
            {
                id: 'abc',
                name: 'Jos Peeters',
                amountOfGamesWon: 7
            },
            {
                id: 'ghi',
                name: 'Mark Maes',
                amountOfGamesWon: 1
            },
            {
                id: 'def',
                name: 'Jan Janssens',
                amountOfGamesWon: 5
            }
        ];
    }

    app.controller('LeaderboardController', ['$scope', leaderboardController]);

})();