'use strict';

angular.module('myApp.configure', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/configure', {
    templateUrl: 'configure/configure.html',
    controller: 'ConfigureCtrl'
  });
}])

.controller('ConfigureCtrl', ['$rootScope', '$scope', '$localStorage',
function($rootScope, $scope, $localStorage) {
    $scope.url = $rootScope.config.url;
    $scope.secret = $rootScope.config.secret;
    $scope.secretType = 'password';
    var setUrls = function(secret){
      secret = secret||'';
      if (secret.startsWith('local')){
        $scope.url = 'http://localhost:7003/v1/';
        $scope.reportingUrl = "http://localhost:24052";
      }else if (secret.startsWith('test')){
        $scope.url = 'https://pay-test.monetary.co/v1/';
        $scope.reportingUrl = "https://reporting-test.monetary.co";
      }else if (secret.startsWith('cert')){
        $scope.url = 'https://pay-cert.monetary.co/v1/';
        $scope.reportingUrl = "https://reporting-cert.monetary.co";
      }else if (secret == ''){
        $scope.url = null;
        $scope.reportingUrl = null;

      }else{
        $scope.url = 'https://pay.monetary.co/v1/';
        $scope.reportingUrl = "https://reporting.monetary.co";
      }

    };
    $scope.$watch('secret',function(newValue, oldValue, scope){
        setUrls(newValue);
    })
    $scope.saveConfig = function(){
      if($scope.url == null || $scope.secret == ''){
        $rootScope.showError('Merchant Secret cannot be empty.');
      }

      var config = {
        url: $scope.url,
        reportingUrl: $scope.reportingUrl,
        secret: $scope.secret
      };
      $rootScope.config = config;
      $localStorage.save('config', config);
      $rootScope.showSuccess("Saved Configuration");
    };
}]);
