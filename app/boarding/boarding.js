'use strict';
angular.module('myApp.boarding', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/boarding', {
		templateUrl: 'boarding/boarding.html',
		controller: 'BoardingCtrl'
	});
}])

.controller('BoardingCtrl', [
	'$rootScope', '$scope', '$localStorage', '$boarding','$location',
function($rootScope, $scope, $localStorage, $boarding, $location){
  $scope.enableGateway = false;
  $scope.enableSchedule = false;
	$scope.wizardStep = 'ApiKey';
	$scope.wizStepOptions = ['Merchant', 'Contacts', 'Addresses', 'Processor', 'Schedule'];
  $scope.merchant = {};
  $scope.contacts = [{Type: 'Owner'}];
	$scope.addresses = [{Type: "Physical Address"}, {Type: "Mailing Address"}];
  $scope.enrollGateway = {};
	$scope.enrollSchedule = {};
	$scope.gatewayProcessor = "";
	$scope.processors = [];
	$scope.confirmation = {};
  $scope.scheduleCredentials = {};

  $scope.developerApiKey = $location.search().apiKey || 'test_api650C14Z974X5';
  $scope.developerApiKeyInput = $scope.developerApiKey;
	$scope.resellers = [];
	$scope.$watch('gatewayProcessor', function(oldVal, newVal){
		$scope.enrollGateway = {};
		switch($scope.gatewayProcessor)
		{
			case 'Vantiv':
				$scope.midCategories = ['Retail'];
				$scope.enrollGateway.MidCategory = 'Retail';
			break;
			case 'WorldPay':
				$scope.midCategories = ['Retail', 'DirectMarket', 'Ecommerce'];
				$scope.enrollGateway.ContactlessCapable  = false;
				$scope.enrollGateway.CustomerActivated  = false;
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
  $scope.$watch('wizardStep', function(oldVal, newVal){
		if(oldVal === newVal){
			return;
		}
		switch($scope.wizardStep)
		{
			case 'Schedule':
				$scope.getProcessors();
			break;
			case 'TermsAndConditions':
				$scope.getTandC();
			break;
			case 'Contacts':
				$scope.getContacts();
			break;
			default:
			break;
		}
	});
	$scope.getMerchant = function(id){
		$boarding.getMerchant(id, function(response){
			if(response.isSuccessful){
				$scope.merchant = response.content;
			}
		});
	};
	$scope.getProcessors = function(){
		$boarding.getProcessors($scope.merchantID, function(response){
			if(response.isSuccessful){
				$scope.processors = response.content;
			}
		});
	};
	$scope.getContacts = function() {
		$boarding.getContacts($scope.merchantID, function(response){
			if(response.isSuccessful){
				$scope.contacts = response.content;
			}else{
				$scope.contacts = [{Type:'Owner'}];
			}
		});
	};

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
		if($scope.merchant.Website === ''){
			$scope.merchant.Website = null;
		}
		$boarding.submitMerchant($scope.merchant, function(response){
			if(!response.isSuccessful) {
				$scope.wizardStep = 'Merchant';
			} else {
				var cfg = $localStorage.config();
				cfg.merchantName = response.content.Name;
				cfg.merchantPhone = response.content.Phone;
				cfg.secret = response.content.SecretAuthenticator;
				$localStorage.config(cfg);
				$scope.merchantID = response.content.ID;
				$scope.wizardStep = 'Contacts';
			}
		});
	};
	$scope.removeContact = function(index) {
		var contact = $scope.contacts[index];
		if(contact.ID){
			alert('Cannot remove this contact once it has been submitted');
		}else if(confirm('Are you sure you want to remove this contact?')){
			$scope.contacts.splice(index, 1);
		}
	};
	$scope.submitContacts = function() {
		$boarding.submitContacts($scope.merchantID, $scope.contacts, function(response){
			if(response.isSuccessful){
				$scope.wizardStep = 'Addresses';
			}else{
				$scope.contactErrors = response.modelState;
			}
		});
	};
	$scope.submitAddresses = function () {
		$boarding.submitAddresses($scope.merchantID, $scope.addresses, function(response){
			if(response.isSuccessful){
				if($scope.enrollInProcessor){
					$scope.wizardStep = 'Processor';
				}
			}
		});
	};
	$scope.submitGateway = function() {
		if($scope.processorEnrollmentSuccessful){
			if($scope.enrollInSchedule){
				$scope.wizardStep = 'Schedule';
			} else {
				$scope.wizardStep = 'TermsAndConditions';
			}
		} else {
			$boarding.submitProcessor($scope.merchantID, $scope.gatewayProcessor, $scope.enrollGateway,
				function(response){
					if(response.isSuccessful){
						$scope.processorEnrollmentSuccessful = true;
						if($scope.enrollInSchedule){
							$scope.wizardStep = 'Schedule';
						}
						else {
							$scope.wizardStep = 'TermsAndConditions';
						}
				}
			});
		}
	};

	$scope.submitSchedule = function() {
		$boarding.submitSchedule($scope.merchantID, $scope.enrollSchedule, function(response){
			if(response.isSuccessful){
				$scope.wizardStep = 'TermsAndConditions';
			}
		});
	};

	$scope.getTandC = function(){
		$boarding.getTandC($scope.merchantID, function(response){
			if(response.isSuccessful){
				$scope.TermsAndConditions = '';
				if (response.content.Processor){
					$scope.TermsAndConditions = response.content.Processor;
				}
				if(response.content.Schedule) {
					$scope.TermsAndCondtions += response.content.Schedule;
				}
			}
		});
	};
	$scope.submitTermsAndConditions = function(){
		$boarding.submitTandC($scope.merchantID, $scope.confirmation, function(response){
			if(response.isSuccessful){
				$rootScope.showSuccess('Monetary Boarding Complete!');
				$location.path('/configure');
			}
		});
	};

}]);
