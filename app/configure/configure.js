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
    var config = $localStorage.config();
    for(var key in config) {
      $scope[key] = config[key];
    }
    $scope.secretType = 'password';
    var setUrls = function(secret){
      var config = $localStorage.config(secret);
      $rootScope.config = config;
      for(var key in config) {
        $scope[key] = config[key];
      }
    };
    $scope.saveConfig = function(){
      if($scope.secret && $scope.secret != ''){
        $localStorage.config($scope.secret);
        setUrls($scope.secret);
        $rootScope.showSuccess("Saved Configuration");
      }else{
        $rootScope.showError("Cannot save empty secret!");
      }
    };
}]);
