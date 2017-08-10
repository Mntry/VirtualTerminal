app.service('$pay', ['$http', '$rootScope', '$localStorage', function($http, $rootScope, $localStorage){
	var buildSuccessHandler = function(callback, suppressNotification, tranType){
		return function(response){
			if(!suppressNotification)
			{
				$rootScope.showSuccess((response.data.Status||"Success")
									+ " (" + (response.data.Account|| "NoAccount") + ")"
									+ ":" + response.data.Message);
			}
			$rootScope.showProgress = false;
			if(callback)
			{
				response.data.tranType = tranType;
				callback({content: response.data, isSuccessful: true});
			}
		};
	};
	var buildFailureHandler = function(callback, suppressNotification){
		return function(response){
			var data = (response.data || {});
			var status = (data.Status||"ERROR");
			var account = (data.Account|| "NoAccount");
			var message = (data.Message || "Server Error. Please try agian.");
			var formattedMsg = status + " (" + account + ")" + ":" + message;
			if(!suppressNotification)
			{
				$rootScope.showError(formattedMsg);
			}
			$rootScope.showProgress = false;
			if(callback)
			{
				response.data.processedDate = Date.now();
				callback({content: response.data, isSuccessful: false, formattedMsg: formattedMsg});
			}
		};
	};
	var headers = {
		 'Authorization': $localStorage.config().secret,
		 'Content-Type': 'application/json'
	 };
	this.processSale = function (payload, callback, suppressNotification){
		headers.Authorization = $localStorage.config().secret;
		$rootScope.showProgress = true;
		$http({
			method: 'POST',
			url: $localStorage.config().url + 'credit/sale/',
			data: JSON.stringify(payload),
			headers: headers
		}).then(buildSuccessHandler(callback, suppressNotification, 'Sale'),
						buildFailureHandler(callback, suppressNotification));

	};
	this.authCheck = function(payload, callback, suppressNotification){
		headers.Authorization = $localStorage.config().secret;
		$rootScope.showProgress = true;
		$http({
			method: 'POST',
			url: $localStorage.config().url + 'credit/authonly',
			data: JSON.stringify(payload),
			headers: headers
		}).then(buildSuccessHandler(callback, suppressNotification), buildFailureHandler(callback, suppressNotification));
	};
	this.processReturn = function(payload, callback, suppressNotification) {
		headers.Authorization = $localStorage.config().secret;
		$rootScope.showProgress = true;
		$http({
			method: 'POST',
			url: $localStorage.config().url + 'credit/return',
			data: JSON.stringify(payload),
			headers: headers
		}).then(buildSuccessHandler(callback, suppressNotification, 'Return'), buildFailureHandler(callback, suppressNotification));
	};
}]);
