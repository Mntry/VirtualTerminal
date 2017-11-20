app.service('$rpt',['$http', '$rootScope', '$localStorage', function($http, $rootScope, $localStorage) {
  var rpts = [];
  var headers = {
     'Authorization': $localStorage.config().secret,
     'Content-Type': 'application/json'
  };
  var groupsLoaded = false;
  var groups = [];
  var $rpt = this;
  this.loadGroups = function(callback){
    $rootScope.showProgress = true;
    if(groupsLoaded){
      $rootScope.showProgress = false;
      callback(groups);
      return;
    }
    headers.Authorization = $localStorage.config().secret;
    $http({
      method: 'GET',
      url: $localStorage.config().reportingUrl +  '/V1/Groups',
      headers: headers
    }).then(function(response){
      groups = response.data;
      this.groupsLoaded = true;
      $rootScope.showProgress = false;
      callback(groups);
    },
    function(reponse) {
        $rootScope.showProgress = false;
        $rootScope.showError('could not load available groups. Try again later');
    });
  };
  var formatFields = function(rpt){
    var today = new Date();
    for(var i in rpt.parameters){
      var p = rpt.parameters[i];
      p.options = [];

      switch(p.format){
        case 'date-time':
        p.placeholder = today.toISOString().slice(0,10);
        break;
        case 'int32':
        p.placeholder = '123';
        break;
        default:
        p.placeholder = '';
      }
      p.formattedName = p.name.replace(/([A-Z])/g, ' $1')
        .replace(/^./, function(str){ return str.toUpperCase(); })
        .trim();
      if(p.name === 'id' && rpt.path.indexOf("Groups/{id}") !== -1){
          p.formattedName = "Group " + p.formattedName;
          p.needsGroups = true;
      }
    }
  };
  this.loadReports = function(callback){
    $rootScope.showProgress = true;
    $http({
        method: 'GET',
        url: $localStorage.config().reportingUrl + '/swagger/docs/V1'
    }).then(
      function(response){
        rpts = [];
        for(var path in response.data.paths){
           var rpt = response.data.paths[path].get;
           if(rpt.schemes && rpt.schemes.indexOf("Utility") !== -1){
             continue; // utility endpoints do not need to be listed
           }
           rpt.operationId = rpt.operationId.replace(/\_/g, " ");
           rpt.path = path;
           formatFields(rpt);
           rpt.parameters = rpt.parameters||[];
           rpts.push(rpt);
        }
        $rpt.loadGroups(function(groups){
          var options = groups.map(function(g){return {value:g.GroupId, text:g.Group};});
          for(var i = 0; i<rpts.length;i++){
            for(var j = 0; j<rpts[i].parameters.length;j++){
              var grpParam = rpts[i].parameters[j];
              if(grpParam.needsGroups){
                grpParam.options = options;
              }
            }
          }
          $rootScope.showProgress = false;
          callback(rpts);
        });
      },
      function(response){
        $rootScope.showProgress = false;
        $rootScope.showError('could not load available reports. Try again later');
      });
  };
  // build header user in getReportData
  var buildHeaders = function(data){
    var result = [];
    if (data.length === 0){
        return [];
    }
    for(var field in data[0]){
        var header = field.replace(/([A-Z])/g, ' $1');
        result.push(header.trim());
    }
    return result;
  };
  this.getReportData = function(operation, callback){
    $rootScope.showProgress = true;
    var path = operation.path;
    var body = {};
    for(var i = 0; i < operation.parameters.length; i++){
      var p = operation.parameters[i];
      switch (p.in) {
        case "path":
          path = path.replace("{" + p.name + "}", encodeURIComponent(p.value));
          break;
        case "body":
          body[p.name] = p.value;
          break;
        default:
          path += ((path.indexOf("?") === -1) ? "?": "&")
            + encodeURIComponent(p.name) + "=" + encodeURIComponent(p.value);
      }
    }

    headers.Authorization = $localStorage.config().secret;
    $http({
      method:'GET',
      url: $localStorage.config().reportingUrl + path,
      body: body,
      headers: headers
    }).then(function(response){
      var headers = buildHeaders(response.data);
      $rootScope.showProgress = false;
      callback(headers, response.data);
      if(response.data.length === 0){
        $rootScope.showSuccess("no data returned");
      }

    }, function(response){
      $rootScope.showProgress = false;
      var msg = 'could not load report data. try again later';
      if (response.status === 400){
        msg = response.data.Status + ":" + response.data.Message;
      }
      $rootScope.showError(msg);
    });
  };
}]);
