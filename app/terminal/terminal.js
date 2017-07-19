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
  var r = sessionStorage.getItem('terminalResponses');
  $scope.responses = [];
  if(r){
    $scope.responses = JSON.parse(r);
  }
  $scope.request = $scope.request||{}; //fields will be added via angular!
  $scope.swipeEnabled = false;
  $scope.$watch('mode', function(newVal, oldVal){
    $scope.swipeEnabled = (newVal)&&newVal == 'Swipe';
  });

  $scope.requestPayment = function(){
    var msg = $scope.request;
    var successResponse = function(response){
      $scope.request = {};
      $scope.mode = 'Manual';
      $scope.responses.unshift(response.content);
      sessionStorage.setItem('terminalResponses', JSON.stringify($scope.responses));
    };
    if($scope.op == "Credit"){
      if($scope.request.Account && $scope.request.Account.indexOf("*") != -1){
        delete $scope.request.Account;
        delete $scope.request.Expiration;
      }
      $pay.processCredit(msg, function(response){
        if (response.isSuccessful){
          successResponse(response);
        }
      });
    }else if ($scope.op == "Gift"){
      var msg = {
        Amount: $scope.request.Amount,
        Account: $scope.request.Account,
        CVV: $scope.request.CVV
      };
      $sv.sale(msg, function(response){
        if(response.isSuccessful){
          successResponse(response);
        }
      });
    }
  };

}]);
