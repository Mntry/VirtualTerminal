app.service('$localStorage', function(){
  var self = this;
	this.save = function(key, value){
		localStorage.setItem(key, JSON.stringify(value));
	};
	this.get = function(key){
		var result = null;
		var value = localStorage.getItem(key);
		if(value){
			result = JSON.parse(value);
		}
		return result;
	}
  this.config = function(newConfig){
    var result = self.get('config');
    if(newConfig){
      for(field in newConfig){
        result[field] = newConfig[field];
      }
    }else{
      newConfig = {};
    }
    var secret = newConfig.secret||result.secret||'';
    if (secret.startsWith('local')){
      result.url = 'http://localhost:7003/v1/';
      result.reportingUrl = "http://localhost:24052";
      result.engageUrl = "http://localhost:37340/V1/";
      result.receiptUrl = "http://localhost:4826/";
    }else if (secret.startsWith('test')){
      result.url = 'https://pay-test.monetary.co/v1/';
      result.reportingUrl = "https://reporting-test.monetary.co";
      result.engageUrl = "https://engage-test.monetary.co/V1/";
      result.receiptUrl = "https://o-test.monetary.co/";
    }else if (secret.startsWith('cert')){
      result.url = 'https://pay-cert.monetary.co/v1/';
      result.reportingUrl = "https://reporting-cert.monetary.co";
      result.engageUrl = "https://engage-cert.monetary.co/V1/";
      result.receiptUrl = "https://o-cert.monetary.co/";
    }else if (secret == ''){
      result.url = null;
      result.reportingUrl = null;
      result.engageUrl = null;
      result.receiptUrl = null;
    }else{
      result.url = 'https://pay.monetary.co/v1/';
      result.reportingUrl = "https://reporting.monetary.co";
      result.engageUrl = "https://engage.monetary.co/V1/";
      result.receiptUrl = "https://o.monetary.co/";
		}
		self.save('config', result);
		return result;
  }
});
