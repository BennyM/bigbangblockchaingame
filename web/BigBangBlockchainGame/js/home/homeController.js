(function() {

    var app = angular.module('bigbangblockchain');

    var homeController = function($scope) {
        $scope.home = 'abc';
    }

    app.controller('HomeController', ['$scope', homeController]);

})();