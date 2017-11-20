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
  $scope.tranType = 'Sale'; //credit == credit sale
  $scope.showEntryModeToggle = $scope.config.showSwiper && $scope.config.showManual;
  if($scope.config.showSwiper){
    $scope.mode = (($scope.config.showManual) ? 'Manual' : 'Swipe');
  } else {
    $scope.mode = 'Manual';
  }
  var r = sessionStorage.getItem('terminalResponses');
  $scope.responses = [];
  if(r){
    $scope.responses = JSON.parse(r);
  }
  $scope.request = $scope.request||{}; //fields will be added via angular!
  $scope.swipeEnabled = false;
  $scope.$watch('mode', function(newVal, oldVal){
    $scope.swipeEnabled = (newVal)&&newVal === 'Swipe';
  });
  $scope.$watch('op', function(newVal, oldVal){
    if($scope.showEntryModeToggle && newVal === 'Gift' && $scope.mode === 'Token')
    {
      $scope.mode = 'Manual';
    }
  });

  $scope.submitRequest = function(){
    var successResponse = function(response){
      $scope.request = {};
      $scope.mode = 'Manual';
      $scope.responses.unshift(response.content);
      sessionStorage.setItem('terminalResponses', JSON.stringify($scope.responses));
    };
    if($scope.op === "Credit"){
      if($scope.mode !== 'Manual'){
        delete $scope.request.Account;
        delete $scope.request.Expiration;
      }
      if($scope.mode !== 'Token'){
        delete $scope.request.Token;
      }
      if($scope.mode !== 'Swipe'){
        delete $scope.request.Track2;
        delete $scope.request.AccountKey;
        delete $scope.request.EncryptedAccount;
      }
      $pay['process'+$scope.tranType]($scope.request, function(response){
        if (response.isSuccessful){
          successResponse(response);
        }
      });
    }else if ($scope.op === "Gift"){
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
