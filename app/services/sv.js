app.service('$sv',['$http', '$rootScope', function($http, $rootScope) {
  var headers = {
     'Authorization': $rootScope.config.secret,
     'Content-Type': 'application/json'
  };
  var createGuid = function()
  {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
  };
  var buildSuccessHandler = function(callback){
		return function(response){
      response.data.guid = createGuid();
      var msg = (response.data.Status||"Success")
								+ " (" + (response.data.Account|| "NoAccount") + ")"
								+ ":" + response.data.Message;
			$rootScope.showSuccess(msg);
			if(callback)
			{
				callback({content: response.data, isSuccessful: true});
			}
		};
	};
	var buildFailureHandler = function(callback){
		return function(response){
			var formattedMsg = (response.data.Status||"ERROR")
							+ " (" + (response.data.Account|| "NoAccount") + ")"
							+ ":" + response.data.Message;
      $rootScope.showError(formattedMsg);
			if(callback)
			{
				callback({content: response.data, isSuccessful: false, formattedMsg: formattedMsg});
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
    if(!payload.CVV || payload.CVV.trim() == ''){
      $rootScope.showError('invalid CVV');
      isValid = false;
    }
    return isValid;
  };

  this.sale = function(payload, callback){
    if (!validatePayload(payload)){
      return;
    }
    $http({
      method: 'POST',
      url: $rootScope.config.url + 'storedvalue/sale',
      data: JSON.stringify(payload),
      headers: headers
    }).then(buildSuccessHandler(callback), buildFailureHandler(callback));
  };
  this.load = function(payload, callback){
    if (!validatePayload(payload)){
      return;
    }
    $http({
      method: 'POST',
      url: $rootScope.config.url + 'storedvalue/load',
      data: JSON.stringify(payload),
      headers: headers
    }).then(buildSuccessHandler(callback), buildFailureHandler(callback));
  };
  this.balance = function(payload, callback){
    if (!validatePayload(payload, false)){
      return;
    }
    $http({
      method: 'POST',
      url: $rootScope.config.url + 'storedvalue/balance',
      data: JSON.stringify(payload),
      headers: headers
    }).then(buildSuccessHandler(callback), buildFailureHandler(callback));
  }
  this.void = function(refNo, callback){
    $http({
      method: 'POST',
      url: $rootScope.config.url + 'storedvalue/sale/'+refNo+'/void',
      headers: headers
    }).then(buildSuccessHandler(callback), buildFailureHandler(callback));
  };
}]);
