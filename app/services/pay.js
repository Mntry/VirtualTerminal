app.service('$pay', ['$http', '$rootScope', '$localStorage', function($http, $rootScope, $localStorage){
	var buildSuccessHandler = function(callback, suppressNotification){
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
				callback({content: response.data, isSuccessful: true});
			}
		};
	};
	var buildFailureHandler = function(callback, suppressNotification){
		return function(response){
			var formattedMsg = (response.data.Status||"ERROR")
							+ " (" + (response.data.Account|| "NoAccount") + ")"
							+ ":" + response.data.Message;
			if(!suppressNotification)
			{
				$rootScope.showError(formattedMsg);
			}
			$rootScope.showProgress = false;
			if(callback)
			{
				callback({content: response.data, isSuccessful: false, formattedMsg: formattedMsg});
			}
		};
	};
	var headers = {
		 'Authorization': $localStorage.config().secret,
		 'Content-Type': 'application/json'
	 };
	this.processCredit = function (payload, callback, suppressNotification){
		headers.Authorization = $localStorage.config().secret;
		$rootScope.showProgress = true;
		$http({
			method: 'POST',
			url: $localStorage.config().url + 'credit/sale/',
			data: JSON.stringify(payload),
			headers: headers
		}).then(buildSuccessHandler(callback, suppressNotification),
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
}]);
