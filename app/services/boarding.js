app.service('$boarding', [ '$http', '$rootScope', '$localStorage', function($http, $rootScope, $localStorage) {
  //todo: write api calls to BoardingAPI
  var apiKey = '';
  var url = '';
  var buildResponseHandler = function(callback, isSuccessful){
		return function(response){
			if(callback)
			{
				$rootScope.showProgress = false;

        var msgs = [];
        if(!isSuccessful){

          for(key in response.data.ModelState){
            var errors = response.data.ModelState[key];
            for(let i = 0; i < errors.length; i++){
              $rootScope.showError(errors[i]);
              msgs.push(errors[i]);
            }
          }
          if(response.data.Message != 'The request is invalid.'){
            msgs.push(response.data.Message);
            $rootScope.showError(response.data.Message);
          }
        }
				callback({
          content: response.data,
          isSuccessful: isSuccessful,
          messages: msgs
        });
			}
		};
	};
  var spoofResponse = function (payload, callback){
    var content = Object.assign({}, payload);
    callback({content: content, wasSuccessful: true});
  }
  var sendRequest = function(callback, method, localPath, payload){
    $rootScope.showProgress = true;
    $rootScope.closeAll();
    var request = {
        method: method,
        url: url + localPath,
        headers: {'Authorization': apiKey, 'Content-Type': 'application/json'}
      };
    if(payload){
      request.data = payload;
    }
    $http(request).then(
      buildResponseHandler(callback, true),
      buildResponseHandler(callback, false));
  };

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
    sendRequest(callback, 'GET', 'Resellers');
  };
  this.submitMerchant = function(merchant, callback){
    sendRequest(callback, 'POST', 'Merchants', merchant);
  };
  this.submitContacts = function(merchantID, contacts, callback){
    var count = contacts.length;
    var wasSuccess = true;
    var notifyUI = function(response){
      count--;
      wasSuccess = wasSuccess && response.isSuccessful;
      if(count <= 0)
      {
        response.isSuccessful = wasSuccess; //aggregation of success
        response.content = contacts;
        callback(response);
      }
    };

    var sendContact = function(contact){
      sendRequest(notifyUI, 'POST', 'Merchants/' + merchantID + '/Contacts', contact);
    };
    for(let i = 0; i < contacts.length; i++){
      var contact = contacts[i];
      sendContact(contact);
    }
  };
  this.submitAddresses = function(merchantID, addresses, callback){
    var count = addresses.length;
    var wasSuccessful = true;
    var msgs = [];
    var notifyUI = function(response){
      count--;
      wasSuccessful = wasSuccessful && response.isSuccessful;
      msgs = msgs.concat(response.messages);
      if(count <= 0){
        response.isSuccessful = wasSuccessful;
        response.messages = msgs;
        callback(response);
      }
    };
    var physicalAddress = addresses[0];
    var mailingAddress = addresses[1];

    sendRequest(notifyUI, 'PUT', 'Merchants/' + merchantID + '/PhysicalAddress',
      physicalAddress);
    sendRequest(notifyUI, 'PUT', 'Merchants/' + merchantID + '/MailingAddress',
        mailingAddress);
  };
  this.submitProcessor = function(merchantID, gatewayProcessor, processor, callback){
    sendRequest(callback, 'POST', 'Merchants/' + merchantID + "/Processors/" + gatewayProcessor, processor);
  };
  this.getTAndC = function(merchantID, callback){
    sendRequest(callback, 'GET', 'Merchants/'+merchantID+"/TermsAndConditions");
  };
  this.submitTandC = function(merchantID, initials, callback){
    sendRequest(callback, 'POST', 'Merchants/'+merchantID+"/AcceptTermsAndConditions", initials);
  };
}]);
