(function() {

    var app = angular.module('bigbangblockchain');

    var gameController = function($scope, $stateParams) {
        $scope.gameid = $stateParams.gameid;
    }

    app.controller('GameController', ['$scope', '$stateParams', gameController]);

})();