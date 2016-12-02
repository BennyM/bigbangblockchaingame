(function() {

    var app = angular.module('bigbangblockchain');

    var leaderboardController = function($scope, $rootScope, gameLogicService) {
        var highscores;
        $scope.account = "0x" + $rootScope.globalKeystore.getAddresses()[0];

        function getHighscores() {
            var highscoreChangedEvents = highscores.HighScoreChanged({}, { fromBlock: 0, toBlock: 'latest' });
            highscoreChangedEvents.get(function (error, result) {

                var joinedPlayers = gameLogicService.getJoinedPlayers();
                var you = gameLogicService.getYou();

                joinedPlayers.forEach(function(player) {
                    $scope.$apply(function() {
                        var scorer = player;
                        scorer.amountOfGamesWon = 0;

                        result.forEach(function(result) {
                            if (result.args.player === scorer.id && scorer.amountOfGamesWon < result.args.score) {
                                scorer.amountOfGamesWon = parseInt(result.args.score);
                            }
                        });

                        $scope.leaderboard.push(scorer);
                    });
                });
                $scope.$apply(function() {
                    var scorer = you;

                    result.forEach(function(result) {
                        if (result.args.player === scorer.id) {
                            scorer.amountOfGamesWon = parseInt(result.args.score);
                        }
                    });

                    $scope.leaderboard.push(scorer);
                });
            });

        }

        $rootScope.loading = true;
        gameLogicService.getLobby().highscoreAddr()
            .then(function(highscoresAddr) {
                highscores = HighScore.at(highscoresAddr);

                $scope.leaderboard = [];
                //var joinedPlayers = gameLogicService.getJoinedPlayers();
                //var you = gameLogicService.getYou();
                //joinedPlayers.forEach(function (player) {
                //    getHighscore(player, you, joinedPlayers.length + 1);
                //});
                //getHighscore(you, you, joinedPlayers.length + 1);
                getHighscores();

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

                $rootScope.loading = false;
            });
    }

    app.controller('LeaderboardController', ['$scope', '$rootScope', 'GameLogicService', leaderboardController]);

})();