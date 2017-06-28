'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
	'ngRoute',
	'myApp.configure',
	'myApp.terminal',
	'myApp.bulk-payments',
	'myApp.version',
	'myApp.stored-value',
	'myApp.reports'
]);
app.service('$localStorage', function(){

	this.save = function(key, value){
		localStorage.setItem(key, JSON.stringify(value));
	};
	this.get = function(key){
		var result = null;
		var value = localStorage.getItem(key);
		if(value){
			result = JSON.parse(value);
		}
		return result;
	}
});

app.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
	$locationProvider.hashPrefix('!');
	$routeProvider.otherwise({redirectTo: '/configure'});
}]);

app.controller("NotificationCtrl", ['$rootScope', function($rootScope){
	$rootScope.notifications = [];;
	$rootScope.closeNotification = function(item){
		var index = $rootScope.notifications.indexOf(item);
		$rootScope.notifications.splice(index, 1);
	};
}]);
app.controller("TabCtrl", ['$scope', '$location', function($scope, $location){
	$scope.tab = $location.path();
	$scope.$on('$locationChangeSuccess', function(){
		$scope.tab = $location.path();
	});
	$scope.classes = function(newTab, curTab){
		var cls = "btn btn-default btn-tab";
		if (newTab == curTab){
			cls += " active";
		}
		return cls;
	};
}]);

app.run(function($rootScope, $localStorage){

		$rootScope.config = $localStorage.get('config');
		//initializing scope
		if (!$rootScope.config){
			$rootScope.config = {
				url: '',
				reportingUrl: '',
				secret: ''
			};
			$localStorage.save('config', $rootScope.config);
		}
});
