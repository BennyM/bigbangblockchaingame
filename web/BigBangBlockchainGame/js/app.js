(function() {

    var app = angular.module('bigbangblockchain', ['ui.router']);

    app.config(['$stateProvider', '$urlRouterProvider', '$compileProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $compileProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'js/home/home.html',
                controller: 'HomeController'
            })
            .state('game', {
                url: '/game/{gameid}',
                templateUrl: 'js/game/game.html',
                controller: 'GameController'
            })
            .state('rules', {
                url: '/game',
                templateUrl: 'js/game/rules.html'
            })
            .state('leaderboard', {
                url: '/leaderboard',
                templateUrl: 'js/leaderboard/leaderboard.html',
                controller: 'LeaderboardController'
            })
        ;

        $urlRouterProvider.otherwise('/');
    }]);

})();