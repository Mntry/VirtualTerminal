'use strict';

angular.module('myApp.configure', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/configure', {
    templateUrl: 'configure/configure.html',
    controller: 'ConfigureCtrl'
  });
}])

.controller('ConfigureCtrl', ['$rootScope', '$scope', '$localStorage', '$swiperFactory',
function($rootScope, $scope, $localStorage, $swiperFactory) {
    var config = $localStorage.config();
    for(var key in config) {
      $scope[key] = config[key];
    }

    $scope.secretType = 'password';
    var storeConfig = function(){
      var config = {};
      var values = Object.getOwnPropertyNames($scope);
      for (var i = 0; i < values.length; i++){
        var key =  values[i];
        if(key.indexOf("$") === 0
        || typeof($scope[key]) === 'function'
        || Array.isArray($scope[key])){
          continue;
        }
        config[key] = $scope[key];
      }
      var config = $localStorage.config(config);
      $rootScope.config = config;
      for(var k in config) {
        $scope[k] = config[k];
      }
    };

    $scope.selectedSwiper = $scope.selectedSwiper || 'None';

    $scope.swipers = $swiperFactory.getListOfSwipers();

    $scope.saveConfig = function(){
      if($scope.secret && $scope.secret != ''){
        $scope.showSwiper =  $scope.selectedSwiper != 'None';
        var swiper = $swiperFactory.getSwiper($scope.selectedSwiper) || {showManual: true};
        $scope.showManual = swiper.showManual;
        storeConfig();
        $rootScope.showSuccess("Saved Configuration");
      }else{
        $rootScope.showError("Cannot save empty secret!");
      }
    };
}]);
