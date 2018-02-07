app.service('$boarding', [ '$http', '$rootScope', '$localStorage', function($http, $rootScope, $localStorage) {
  //todo: write api calls to BoardingAPI
  var apiKey = '';
  var url = '';
  var buildResponseHandler = function(callback, isSuccessful){
		return function(response, isSuccessful){
			if(callback)
			{
				$rootScope.showProgress = false;
				callback({content: response.data, isSuccessful: isSuccessful});
			}
		};
	};
  var spoofResponse = function (payload, callback){
    var content = Object.assign({}, payload);
    callback({content: content, wasSuccessful: true});
  }

  this.setCredentials = function(apiKeyInput){
    apiKey = apiKeyInput;
    if(apiKey.startsWith('test')){
      url = "https://boarding-test.monetary.co/";
    }else if(apiKey.startsWith('cert')){
      url = "https://boarding-cert.monetary.co/";
    }else{
      url = "https://boarding.monetary.co/";
    }
    url = url + "V1/";
  };

  this.getResellers = function(callback) {
    $http({
        method: 'GET',
        url: url + "Resellers",
        headers: {'Authorization': apiKey, 'Content-Type': 'application/json'}
      }).then(buildResponseHandler(callback, true),
            buildResponseHandler(callback, false));
  };
  this.submitMerchant = function(merchant, callback){

    spoofResponse(merchant, callback);
    // $http({
    //   method: 'POST',
    //   url: url + 'Merchants',
    //   headers: {'Authorization': apiKey, 'Content-Type': 'application/json'}
    // }).then(buildResponseHandler(callback, true),
    //         buildResponseHandler(callback, false));
  };
  this.submitContacts = function(contacts, callback){
    spoofResponse(contacts, callback);
  };

}]);
