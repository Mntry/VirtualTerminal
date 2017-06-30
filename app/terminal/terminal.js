'use strict';

angular.module('myApp.terminal', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/terminal', {
    templateUrl: 'terminal/terminal.html',
    controller: 'TerminalCtrl'
  });
}])

.controller('TerminalCtrl', ['$scope', '$pay', '$sv',
function($scope, $pay, $sv) {
  $scope.op = "Credit";
  $scope.mode = 'process';
  $scope.responses = $scope.responses||[];
  $scope.request = $scope.request||{}; //fields will be added via angular!
  $scope.requestPayment = function(){
    var msg = $scope.request;
    if($scope.op == "Credit"){
      $pay.processCredit(msg, function(response){
        if (response.isSuccessful){
          $scope.request = {};
          $scope.responses.unshift(response.content);
        }
      });
    }else if ($scope.op == "Gift"){
      $sv.sale({
        Amount: $scope.request.Amount,
        Account: $scope.request.Account,
        CVV: $scope.request.CVV
      });
    }
  };

}]);
