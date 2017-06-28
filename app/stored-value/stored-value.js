'use strict';

angular.module('myApp.stored-value', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/stored-value', {
    templateUrl: 'stored-value/stored-value.html',
    controller: 'StoredValueCtrl'
  });
}])

.controller('StoredValueCtrl', ['$scope', '$sv',
function($scope, $sv) {
    $scope.op = "Sale";
    $scope.responses =[];
    var r = sessionStorage.getItem('svResponses');
    if(r){
      $scope.responses = JSON.parse(r);
    }

    $scope.submitTransaction = function(){
      var op = $scope.op;
      var payload = $scope['build'+op+'Request']();
      $sv[op.toLowerCase()](payload, function(response){
        if(response.isSuccessful){
          var result = response.content;
          result.Operation = op;
          if(op == 'Balance'){
            result.Amount = result.Balance;
          }
          result.Voided = false;
          $scope.responses.unshift(result);
        }
      });
    };
    $scope.buildBalanceRequest = function() {
      return {
        Account: $scope.account,
        CVV: $scope.cvv
      };
    };
    $scope.buildSaleRequest = function(){
      var req = $scope.buildBalanceRequest();
      req.Amount = $scope.amount;
      return req;
    };
    $scope.buildLoadRequest = function() {
      return $scope.buildSaleRequest();
    };
    $scope.showVoidButton = function(r){
      return r.Voided == false && (r.Operation == 'Sale' || r.Operation == 'Load');
    }
    $scope.voidStoredValue = function(originalResponse) {
      $sv.void(originalResponse.RefNo, function(response){
        if(!response.isSuccessful){
          return;
        }
        response.content.Operation = 'Void'
        $scope.responses.unshift(response.content);

        originalResponse.Voided = true;
      });
    };

    $scope.$on('$locationChangeStart', function(event){
      if ($scope.responses.length == 0){
        return;
      }
      sessionStorage.setItem('svResponses', JSON.stringify($scope.responses));
    });
}]);
