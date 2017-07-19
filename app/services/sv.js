app.service('$sv',['$http', '$rootScope', '$localStorage', function($http, $rootScope, $localStorage) {
  var headers = {
     'Authorization': $localStorage.config().secret,
     'Content-Type': 'application/json'
  };
  var buildSuccessHandler = function(callback){
		return function(response){
      response.data.guid = $localStorage.createGuid();
      var msg = (response.data.Status||"Success")
								+ " (" + (response.data.Account|| "NoAccount") + ")"
								+ ": " + response.data.Message;
      if(!response.data.Amount){
        msg = "Current Balance for " + response.data.Account
        + " is " + response.data.Balance;
      }else if(response.data.Balance){
        msg += " (Balance: "+response.data.Balance+")";
      }
			$rootScope.showSuccess(msg);
      $rootScope.showProgress = false;
			if(callback)
			{
				callback({content: response.data, isSuccessful: true});
			}
		};
	};
	var buildFailureHandler = function(callback){
		return function(response){
      var data = response.data || {};
			var formattedMsg = (data.Status||"ERROR")
							+ " (" + (data.Account|| "NoAccount") + ")"
							+ ":" + data.Message;
      if(data.Balance){
        formattedMsg += "(Balance: "+data.Balance+")";
      }
      $rootScope.showError(formattedMsg);
      $rootScope.showProgress = false;
			if(callback)
			{
				callback({content: data, isSuccessful: false, formattedMsg: formattedMsg});
			}
		};
	};
  var validatePayload = function(payload, validateAmount){
    if (typeof(validateAmount) == 'undefined'){
      validateAmount = true;
    }
    var isValid = true;
    if( validateAmount && (!payload.Amount || payload.Amount.trim() =='')){

      $rootScope.showError('invalid amount');
      isValid = false;
    }
    if(!payload.Account || payload.Account.trim() == ''){
      $rootScope.showError('invalid account');
      isValid = false;
    }
    return isValid;
  };

  this.sale = function(payload, callback){
    if (!validatePayload(payload)){
      return;
    }
    $rootScope.showProgress = true;
    headers.Authorization = $localStorage.config().secret;
    $http({
      method: 'POST',
      url: $localStorage.config().url + 'storedvalue/sale',
      data: JSON.stringify(payload),
      headers: headers
    }).then(buildSuccessHandler(callback), buildFailureHandler(callback));
  };
  this.load = function(payload, callback){
    if (!validatePayload(payload)){
      return;
    }
    $rootScope.showProgress = true;
    headers.Authorization = $localStorage.config().secret;
    $http({
      method: 'POST',
      url: $localStorage.config().url + 'storedvalue/load',
      data: JSON.stringify(payload),
      headers: headers
    }).then(buildSuccessHandler(callback), buildFailureHandler(callback));
  };
  this.balance = function(payload, callback){

    if (!validatePayload(payload, false)){
      return;
    }
    $rootScope.showProgress = true;
    headers.Authorization = $localStorage.config().secret;
    $http({
      method: 'POST',
      url: $localStorage.config().url + 'storedvalue/balance',
      data: JSON.stringify(payload),
      headers: headers
    }).then(buildSuccessHandler(callback), buildFailureHandler(callback));
  }
  this.void = function(refNo, callback){
    $rootScope.showProgress = true;
    headers.Authorization = $localStorage.config().secret;
    $http({
      method: 'POST',
      url: $localStorage.config().url + 'storedvalue/sale/'+refNo+'/void',
      headers: headers
    }).then(buildSuccessHandler(callback), buildFailureHandler(callback));
  };
}]);
