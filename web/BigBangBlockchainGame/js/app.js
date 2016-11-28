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
        ;

        $urlRouterProvider.otherwise('/');
    }]);

})();