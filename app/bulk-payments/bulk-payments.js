'use strict';

angular.module('myApp.bulk-payments', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/bulk-payments', {
		templateUrl: 'bulk-payments/bulk-payments.html',
		controller: 'BulkPaymentsCtrl'
	});
}])

.controller('BulkPaymentsCtrl', ['$rootScope', '$scope', '$localStorage', '$pay',
function($rootScope, $scope, $localStorage, $pay) {
	$scope.mode = 'process';
	var accounts = ($localStorage.get('savedAccounts') || []).map(function(a){
		a.showHistory = false;
		return a;
	});

	$scope.savedAccounts = accounts;
  $scope.request = $scope.request || {};
	$scope.hasChanges = false;
	$scope.processing = false;
	$scope.backupContents = '';
	$scope.authAndAddCard = function (){
		if($scope.mode == 'process'){
			return; //user clicked cancel
		}
		var authData = $scope.request;
		authData.Amount = 0.00;
		var reccuringAmount = $scope.reccuringAmount;
		var alias = $scope.alias;
		$pay.authCheck(authData, function(response){
			if(!response.isSuccessful){
				$rootScope.notifications.unshift({
					class: 'alert-danger',
					message: (response.data.Status||"ERROR")
									+ " (" + (response.data.Account|| "NoAccount") + ")"
									+ ":" + response.data.Message
				});
				return;
			}
			var content = response.content;
			var matchingAccounts = $scope.savedAccounts.filter(function(a){
				return a.token == content.Token || a.alias == alias;
			})
			if (matchingAccounts.length > 0)
			{
				var index = $scope.savedAccounts.indexOf(matchingAccounts[0]);

				$rootScope.notifications.unshift({
					class: 'alert-danger',
					message: "An account already exists for: " + content.Account.replace("X", "")
								+ ", alias:" + alias + " '(see row "+(index+1)+")"
				});
				return;
			}

			$scope.savedAccounts.unshift({
				token: content.Token,
				account: content.Account,
				alias: alias,
				amount: reccuringAmount,
				lastProcessedDate: null,
				history: [],
			});
			$scope.request = {};
			$scope.alias = '';
			$scope.mode = 'process';


			$localStorage.save('savedAccounts', $scope.savedAccounts);
			$rootScope.notifications.unshift({
				class: 'alert-success',
				message: "Added " + alias
			});
		}, true);
	};

	$scope.removeAccount = function (account){
		if(!confirm('are you sure you want to remove ' + account.alias + "?"))
		{
			return;
		}
		var index = $scope.savedAccounts.indexOf(account);
		$scope.savedAccounts.splice(index, 1);
		$localStorage.save('savedAccounts', $scope.savedAccounts);
	};


	$scope.bulkProcess = function(accountsToProcess) {
		$scope.processing = true;
		var failures = [];
		var successCount = 0;
		var processedCount = 0;
		for(let i = 0; i < accountsToProcess.length; i++){
			var account = accountsToProcess[i];
			var payload = {
				Token: account.token,
				Amount: account.amount,
			};
			if (account.zip && account.zip.length > 0){
				payload.Zip = account.zip;
			}

			$pay.processCredit(payload, function(response){
				processedCount++;
				if(response.isSuccessful){
					successCount++;
				}
				else{
					failures.push(response.content);
				}
				var curAccount = $scope.savedAccounts.filter(function(a){return a.token == response.content.Token});
				if(curAccount.length > 0){
					curAccount[0].lastProcessedDate = Date.now();
					var refNo = response.content.RefNo || ("noRefNo"+curAccount[0].history.length);
					curAccount[0].history.unshift({amount:response.content.Amount, processedDate: Date.now(), refNo: refNo});
				}
				if(processedCount == accountsToProcess.length){
					if(failures.length == 0){
						$rootScope.notifications.unshift({
							class: 'alert-success',
							message: "Successfully processed " + successCount + " transactions"
						});
					}else{
						for(let f; f > failures.length; f++){
							var curFail = failures[f];
							$rootScope.notifications.unshift({
								class: 'alert-danger',
								message: curFail.formattedMsg
							});
						}
					}
					$scope.processing = false;
					$scope.saveAmountChanges(true);
				}
			}, true);
		}

	};

	$scope.saveAmountChanges = function(suppressNotification) {
			$localStorage.save('savedAccounts', $scope.savedAccounts);
			if(typeof(suppressNotification) === 'undefined' || suppressNotification == false)
			{
				$rootScope.notifications.unshift({
					class: 'alert-success',
					message: "Saved Amount Changes"
				});
			}
			$scope.hasChanges = false;
	};

	$scope.saveAndBulkProcess = function() {
			$scope.bulkProcess($scope.savedAccounts);
	};

	$scope.backup = function() {
			var filename = 'BulkProcessingBackup.json';
			var data = $scope.savedAccounts;

		  if (!data) {
		    console.error('No data');
		    return;
		  }

		  if (!filename) {
		    filename = 'download.json';
		  }

		  if (typeof data === 'object') {
		    data = JSON.stringify(data, undefined, 2);
		  }

		  var blob = new Blob([data], {type: 'text/json'});

		  // FOR IE:

		  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
		      window.navigator.msSaveOrOpenBlob(blob, filename);
		  }
		  else{
		      var e = document.createEvent('MouseEvents'),
		          a = document.createElement('a');

		      a.download = filename;
		      a.href = window.URL.createObjectURL(blob);
		      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
		      e.initEvent('click', true, false, window,
		          0, 0, 0, 0, 0, false, false, false, false, 0, null);
		      a.dispatchEvent(e);
		  }
	};
	$scope.importBackup = function() {

		var backupData = [];
		try{
			backupData = JSON.parse($scope.backupContents);
			if (!Array.isArray(backupData)){
				throw "backup data is not a json array!";
			}
			for(var i = 0; i < backupData.length; i++){
				var account = backupData[i];
				if(typeof(account.token) !== 'string'){
					throw "account at index " + i + " does not have a valid token";
				}
				if(typeof(account.amount) !== 'string' || parseFloat(account.amount) == "NaN"){
					throw "account at index " + i + " does not have a valid Amount";
				}
			}
		}catch(e){
			var msg = e.message || e.toString();
			$rootScope.notifications.unshift({
				class: 'alert-danger',
				message: "Fail: " + msg
			});
			return;
		}

		if(!confirm('You will wipe out all existing saved accounts. Are you sure?')){
			return;
		}
		$scope.savedAccounts = backupData;
		$scope.saveAmountChanges();
		$scope.mode = 'process'
	};

}]);
