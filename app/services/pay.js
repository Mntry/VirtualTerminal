app.service('$pay', ['$http', '$rootScope', function($http, $rootScope){
	$rootScope.config;
	var buildSuccessHandler = function(callback, suppressNotification){
		return function(response){
			if(!suppressNotification)
			{
				$rootScope.showSuccess((response.data.Status||"Success")
									+ " (" + (response.data.Account|| "NoAccount") + ")"
									+ ":" + response.data.Message);
			}
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
			if(callback)
			{
				callback({content: response.data, isSuccessful: false, formattedMsg: formattedMsg});
			}
		};
	};
	var headers = {
		 'Authorization': $rootScope.config.secret,
		 'Content-Type': 'application/json'
	 };
	this.processCredit = function (payload, callback, suppressNotification){
		$http({
			method: 'POST',
			url: $rootScope.config.url + 'credit/sale/',
			data: JSON.stringify(payload),
			headers: headers
		}).then(buildSuccessHandler(callback, suppressNotification),
						buildFailureHandler(callback, suppressNotification));

	};
	this.authCheck = function(payload, callback, suppressNotification){
		$http({
			method: 'POST',
			url: $rootScope.config.url + 'credit/authonly',
			data: JSON.stringify(payload),
			headers: headers
		}).then(buildSuccessHandler(callback, suppressNotification), buildFailureHandler(callback, suppressNotification));
	};
}]);
