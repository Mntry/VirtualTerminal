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
							+ " (" + (data.Account||data.Identifier||"NoAccount") + ")"
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
  var validatePayload = function(payload, fieldsToValidate){
    if (typeof(fieldsToValidate) == 'undefined'){
      fieldsToValidate = ['Amount', 'Account'];
    }
    var shouldValidate = function(field)  {return fieldsToValidate.indexOf(field) != -1;};
    var isNullOrEmpty = function(val) {return (!val || val.trim() == '');};
    var validate = function(field){
      if(shouldValidate(field) && isNullOrEmpty(payload[field])){
        $rootScope.showError('invalid ' + field.toLowerCase());
        return false;
      }
      return true;
    };
    var isValid = validate('Amount');
    isValid = isValid && validate('Account');
    isValid = isValid && validate('CVV');
    isValid = isValid && validate('Identifier');
    isValid = isValid && validate('NewIdentifier');
    //only fields that contain '||'
    var conditionalReqirements = fieldsToValidate.filter(function(field){return (field.indexOf('||') > -1)});
    for(var i = 0; i < conditionalReqirements.length; i++){
      var field = conditionalReqirements[i];
      var conditionalfields = field.split('||');
      var isConditionValid = true;
      //at least one of the || fields needs a value
      var allConditionalFieldsAreEmpty =  (conditionalfields.filter(function(f){return !isNullOrEmpty(payload[f]);}).length == 0);
      if(allConditionalFieldsAreEmpty){
        $rootScope.showError('At least one of the following is required: ' + conditionalfields.join() + '.');
      }
      isValid = isValid && !allConditionalFieldsAreEmpty;
    }


    return isValid;
  };
  this.create = function(payload, callback){
    //create has no required fields
    $rootScope.showProgress = true;
    headers.Authorization = $localStorage.config().secret;
    $http({
      method: 'POST',
      url: $localStorage.config().url + 'storedvalue/create',
      data: JSON.stringify(payload),
      headers:headers
    }).then(buildSuccessHandler(callback), buildFailureHandler(callback));
  }
  this.set = function(payload, callback) {
    if(!validatePayload(payload, ['Account||Identifier', 'NewIdentifier||Lock||CreditLimit'])){
      return;
    }
    $rootScope.showProgress = true;
    headers.Authorization = $localStorage.config().secret;
    $http({
      method: 'POST',
      url: $localStorage.config().url + 'storedvalue/set',
      data: JSON.stringify(payload),
      headers:headers
    }).then(buildSuccessHandler(callback), buildFailureHandler(callback));
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
    if (!validatePayload(payload, ['Account||Identifier'])){
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

    if (!validatePayload(payload, ['Account||Identifier'])){
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
