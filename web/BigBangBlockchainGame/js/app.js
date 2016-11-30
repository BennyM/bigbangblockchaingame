(function() {

    var app = angular.module('bigbangblockchain', ['ui.router']);

    app.config(['$stateProvider', '$urlRouterProvider', '$compileProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $compileProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        $stateProvider
            .state('root', {
                abstract: true,
                resolve: {
                    gameLogicService: ['GameLogicService', function(gameLogicService) {
                        return gameLogicService.initializeGame();
                    }]
                },
                views: {
                    '': {
                        template: '<ui-view/>'
                    }
                }
            })
            .state('home', {
                parent: 'root',
                url: '/',
                templateUrl: 'js/home/home.html',
                controller: 'HomeController'
            })
            .state('game', {
                parent: 'root',
                url: '/game/{gameid}',
                templateUrl: 'js/game/game.html',
                controller: 'GameController'
            })
            .state('rules', {
                parent: 'root',
                url: '/game',
                templateUrl: 'js/game/rules.html'
            })
            .state('leaderboard', {
                parent: 'root',
                url: '/leaderboard',
                templateUrl: 'js/leaderboard/leaderboard.html',
                controller: 'LeaderboardController'
            })
        ;

        $urlRouterProvider.otherwise('/');
    }]);

})();