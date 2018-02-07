'use strict';
angular.module('myApp.boarding', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/boarding', {
		templateUrl: 'boarding/boarding.html',
		controller: 'BoardingCtrl'
	});
}])

.controller('BoardingCtrl', ['$rootScope', '$scope', '$localStorage', '$boarding',
function($rootScope, $scope, $localStorage, $boarding){
  $scope.enableGateway = false;
  $scope.enableSchedule = false;
	$scope.wizardStep = 'ApiKey';
	$scope.wizStepOptions = ['Merchant', 'Contacts', 'Addresses', 'Processor', 'Schedule'];
  $scope.merchant = {};
  $scope.contacts = [{Type: 'Owner'}];
	$scope.addresses = [{Type: "Physical Address"}, {Type: "Mailing Address"}]
  $scope.enrollGateway = {};
	$scope.gatewayProcessor = "";
  $scope.scheduleCredentials = {};

  $scope.developerApiKey = 'test_api4XA6VYZRTAKW';
  $scope.developerApiKeyInput = 'test_api4XA6VYZRTAKW';
	$scope.resellers = [];
	$scope.$watch('gatewayProcessor', function(oldVal, newVal){
		switch($scope.gatewayProcessor)
		{
			case 'Vantiv':
				$scope.midCategories = ['Retail'];
				$scope.enrollGateway.MidCategory = 'Retail';
			break;
			case 'WorldPay':
				$scope.midCategories = ['Retail', 'DirectMarket', 'Ecommerce'];
			break;
			case 'Heartland':
				$scope.midCategories = ['Retail', 'Restaurant'];
			break;
			case 'FirstData':
				$scope.midCategories = ['Retail', 'Restaurant', 'Grocery', 'Ecommerce'];
			break;
			case 'TSYS':
				$scope.midCategories = ['Retail', 'Restaurant', 'Grocery', 'DirectMarket', 'Ecommerce'];
			break;
			default:
				$scope.midCategories = ['Retail', 'Restaurant', 'Ecommerce'];
			break;
		}
	});


  $scope.setBoardingApiValues = function() {
		$scope.developerApiKey = $scope.developerApiKeyInput;
		$scope.wizardStep = 'Merchant';
		$boarding.setCredentials($scope.developerApiKeyInput);
		$boarding.getResellers(function(response) {
			$scope.resellers = response.content;
			if(response.content.length === 0){
				$scope.developerApiKey = null;
				$scope.wizardStep = 'ApiKey';
				$rootScope.showError('No resellers on file for this api key. Please use another.');
			}else if(response.content.length === 1){
				$scope.merchant.ResellerID = response.content[0].ID;
			}
		});
	};
	if($scope.developerApiKey !== null && $scope.developerApiKey !== ''){
		$scope.setBoardingApiValues();
	}

	$scope.submitMerchant = function() {
		$scope.wizardStep = 'Contacts';
		if(!$scope.merchant.wasSuccessful){
			$boarding.submitMerchant($scope.merchant, function(response){
				$scope.merchant.wasSuccessful = response.wasSuccessful;
				if(!response.wasSuccessful){
					$rootScope.showError(response.data.message);
					$scope.merchantModelState = response.ModelState;
					$scope.wizardStep = 'Merchant';
				}
			});
		}
	};

	$scope.submitContacts = function() {
		$scope.wizardStep = 'Addresses';
		//todo submit contacts
	};
	$scope.submitAddresses = function () {
		if($scope.enrollInProcessor){
			$scope.wizardStep = 'Processor';
		}
	};
	$scope.submitGateway = function() {
		if($scope.enrollInSchedule){
			$scope.wizardStep = 'Schedule';
		}
		else {
			$scope.wizardStep = 'TermsAndCondtions';
		}
	};

}]);
