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
        var modelState = {};
        if(!isSuccessful){
          if(response.data && !response.data.ModelState){
            response.data.ModelState = {};
          }
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
          modelState = response.data.ModelState;
        }


				callback({
          content: response.data,
          isSuccessful: isSuccessful,
          messages: msgs,
          modelState: modelState
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
    var method = 'POST';
    var uri = 'Merchants';
    if(merchant.ID){
      method = 'PUT';
      uri += "/" + merchant.ID;
    }
    sendRequest(callback, method, uri, merchant);
  };
  this.getMerchant = function(merchantID, callback) {
    sendRequest(callback, 'GET', 'Merchants/'+merchantID);
  };
  this.getContacts = function(merchantID, callback) {
    //if no conacts, then we will add an empty owner to default
    var callbackWrapper = function(response) {
      if (response.isSuccessful){
         if (response.content.length === 0){
           response.content = [{Type:'Owner'}];
         }else{
           response.content = response.content.sort(function(a,b){
             return (a.Type < b.Type) - (a.Type > b.Type);
           });
         }
      }
      callback(response);
    };
    sendRequest(callbackWrapper, 'GET', 'Merchants/' + merchantID + '/Contacts');
  };
  this.submitContacts = function(merchantID, contacts, callback){
    var count = contacts.length;
    var wasSuccess = true;
    var aggregateState = [];
    var notifyUI = function(response){
      count--;
      wasSuccess = wasSuccess && response.isSuccessful;
      if(!response.modelState){
        aggregateState.push({}); //empty of errors!
      }else{
        aggregateState.push(response.modelState);
      }
      if(count <= 0)
      {
        response.isSuccessful = wasSuccess; //aggregation of success
        response.content = contacts;
        response.modelState = aggregateState;
        callback(response);
      }
    };
    var sendContact = function(contact){
      var path = 'Merchants/' + merchantID + '/Contacts';
      var method = 'POST';
      if(contact.ID){
        path += '/' + contact.ID;
        method = 'PUT';
      }
      sendRequest(notifyUI, method, path, contact);
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
  this.getProcessors = function(merchantID, callback){
    sendRequest(callback, 'GET', 'Merchants/' + merchantID + '/Processors');
  };
  this.submitSchedule = function(merchantID, schedulePayload, callback) {
    sendRequest(callback, 'PUT', 'Merchants/' + merchantID + "/Schedule", schedulePayload);
  };
  this.submitGift = function(merchantID, giftPayload, callback) {
    sendRequest(callback, 'POST', 'Merchants/' + merchantID + "/StoredValue", giftPayload);
  };
  this.submitEngage = function(merchantID, engagePayload, callback) {
    sendRequest(callback, 'PUT', 'Merchants/' + merchantID + '/Engage', engagePayload);
  };

  this.getTandC = function(merchantID, callback){
    sendRequest(callback, 'GET', 'Merchants/'+merchantID+"/TermsAndConditions");
  };
  this.submitTandC = function(merchantID, initials, callback){
    sendRequest(callback, 'POST', 'Merchants/'+merchantID+"/AcceptTermsAndConditions", initials);
  };
}]);
