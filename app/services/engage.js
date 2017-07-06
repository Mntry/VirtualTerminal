app.service('$engage', ['$http', '$rootScope', '$localStorage', function($http, $rootScope, $localStorage){
	$rootScope.config;
	var buildResponseHandler = function(callback){
		return function(response, isSuccessful){
			if(callback)
			{
				callback({content: response.data, isSuccessful: isSuccessful});
			}
		};
	};
	var headers = {
		 'Authorization': $rootScope.config.secret,
		 'Content-Type': 'application/json'
	 };
	this.postReciept = function (payload, callback){
		headers.Authorization = $localStorage.config().secret;
		$http({
			method: 'POST',
			url: $localStorage.config().engageUrl + 'credit/sale/',
			data: JSON.stringify(payload),
			headers: headers
		}).then(buildResponseHandler(callback, true),
						buildResponseHandler(callback, false));
	};

}]);
