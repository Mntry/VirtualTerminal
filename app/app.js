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


app.config(['$locationProvider',  '$routeProvider', function($locationProvider,  $routeProvider ) {
	$locationProvider.hashPrefix('!');
	$routeProvider.otherwise({redirectTo: '/terminal'});
}]);

app.controller("NotificationCtrl", ['$rootScope', '$timeout', function($rootScope, $timeout){
	$rootScope.notifications = [];
	$rootScope.showSuccess = function(message){
		var note = {
			class: 'alert-success',
			message: message
		};
		$rootScope.notifications.unshift(note);
		$timeout(function(){
			$rootScope.closeNotification(note);
		}, 10000);
	};
	$rootScope.showError = function(message){
		var note = {
			class: 'alert-danger',
			message: message
		};
		$rootScope.notifications.unshift(note);
	};
	$rootScope.closeAll = function(){
		$rootScope.notifications = [];
	};
	$rootScope.closeNotification = function(item){
		var index = $rootScope.notifications.indexOf(item);
		$rootScope.notifications.splice(index, 1);
	};

	$rootScope.$on('$locationChangeSuccess', function() {
		$rootScope.closeAll();
	});
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

app.run(function($rootScope, $localStorage, $location){
		$rootScope.showProgress = false;
		$rootScope.config = $localStorage.config();
		//initializing scope
		if (!$rootScope.config.secret || $rootScope.config.secret == ''){
			$rootScope.config = {
				url: '',
				reportingUrl: '',
				secret: ''
			};
			$localStorage.save('config', $rootScope.config);
			$location.path('/configure');
		}
});
