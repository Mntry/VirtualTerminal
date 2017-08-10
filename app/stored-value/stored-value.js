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

    $scope.swipeEnabled = true;
    $scope.swiperMode = 'Gift';
    $scope.resetAdvanced = function(){
      $scope.promo = false;
      $scope.lock = false;
      $scope.overwriteCVV = false;
      $scope.invoiceNo = '';
      $scope.identifier = '';
      $scope.creditLimit = '';
      if($scope.op == 'Create'){
        $scope.account = '';
      }
    };
    $scope.resetAdvanced();
    var r = sessionStorage.getItem('svResponses');
    if(r){
      $scope.responses = JSON.parse(r);
    }
    $scope.$watch('op', function(newVal, oldVal){
      $scope.resetAdvanced();
    });
    $scope.submitTransaction = function(){
      var op = $scope.op;
      var payload = $scope['build'+op+'Request']();
      $sv[op.toLowerCase()](payload, function(response){
        if(response.isSuccessful){
          var result = response.content;
          result.Operation = op;
          result.Voided = false;
          if(op == 'Balance'){
            result.Amount = result.Balance;
          }
          else{
            $scope.account = '';
            $scope.resetAdvanced();
            $scope.cvv = '';
            $scope.swipeEnabled = true;
            $scope.responses.unshift(result);
          }
          $scope.amount = '';
        }
      });
    };
    $scope.buildBalanceRequest = function() {
      var result = {
        Account: $scope.account,
        CVV: $scope.cvv
      };
      if ($scope.showAdvanced){
        result.Identifier = $scope.identifier;
        result.OverrideCVV = $scope.overwriteCVV;
      }
      return result;
    };
    $scope.buildCreateRequest = function() {
      return {
        Amount: $scope.amount,
        NewIdentifier: $scope.identifier,
        InvoiceNo: $scope.invoiceNo,
        Promo: $scope.promo,
        Lock: $scope.lock
      };
    };
    $scope.buildSetRequest = function() {
      var req = $scope.buildBalanceRequest();
      delete req.Identifier;
      req.NewIdentifier = $scope.identifier;
      req.Lock = $scope.lock;
      req.CreditLimit = $scope.creditLimit;
      return req;
    };
    $scope.buildSaleRequest = function(){
      var req = $scope.buildBalanceRequest();
      req.Amount = $scope.amount;
      if($scope.showAdvanced){
        req.Identifier = $scope.identifier;
        req.OverrideCVV = $scope.overwriteCVV;
        req.InvoiceNo = $scope.InvoiceNo;
      }
      return req;
    };
    $scope.buildLoadRequest = function() {
      var req =  $scope.buildSaleRequest();
      if($scope.showAdvanced){
        req.Promo = $scope.promo;
      }
      return req;
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
