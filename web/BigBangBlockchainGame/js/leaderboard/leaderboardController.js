(function() {

    var app = angular.module('bigbangblockchain');

    var leaderboardController = function($scope, $rootScope, gameLogicService) {
        var highscores;

        function getHighscore(player, you, joinedPlayersLength) {
            highscores.highScoreOfPlayer.call(player.id, { from: you.id })
                .then(function (score) {
                    $scope.$apply(function () {
                        $scope.leaderboard.push(player);
                        player.amountOfGamesWon = parseInt(score);

                        if ($scope.leaderboard.length === joinedPlayersLength) {
                            $rootScope.loading = false;
                        }
                    });
                });
        }

        $rootScope.loading = true;
        gameLogicService.getLobby().highscoreAddr()
            .then(function(highscoresAddr) {
                highscores = HighScore.at(highscoresAddr);

                $scope.leaderboard = [];
                var joinedPlayers = gameLogicService.getJoinedPlayers();
                var you = gameLogicService.getYou();
                joinedPlayers.forEach(function (player) {
                    getHighscore(player, you, joinedPlayers.length + 1);
                });
                getHighscore(you, you, joinedPlayers.length + 1);

                var highscoreChangedEvent = highscores.HighScoreChanged();
                highscoreChangedEvent.watch(function(error, result) {
                    $scope.$apply(function() {
                        var player = result.args.player;
                        var score = parseInt(result.args.score);

                        $scope.leaderboard.forEach(function(scorer) {
                            if (scorer.id === player) {
                                scorer.amountOfGamesWon = score;
                            }
                        });
                    });
                });
            });
    }

    app.controller('LeaderboardController', ['$scope', '$rootScope', 'GameLogicService', leaderboardController]);

})();