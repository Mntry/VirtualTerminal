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
  $scope.mode = 'Manual';
  $scope.responses = $scope.responses||[];
  $scope.request = $scope.request||{}; //fields will be added via angular!
  $scope.swipeEnabled = false;
  $scope.$watch('mode', function(newVal, oldVal){
    $scope.swipeEnabled = (newVal)&&newVal == 'Swipe';
  });

  $scope.requestPayment = function(){
    var msg = $scope.request;
    if($scope.op == "Credit"){
      if($scope.request.Account && $scope.request.Account.indexOf("*") != -1){
        delete $scope.request.Account;
      }
      $pay.processCredit(msg, function(response){
        if (response.isSuccessful){
          $scope.request = {};
          $scope.mode = 'Manual';
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
