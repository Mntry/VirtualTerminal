'use strict';

angular.module('myApp.reports', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/reports', {
    templateUrl: 'reports/reports.html',
    controller: 'ReportsCtrl'
  });
}])

.controller('ReportsCtrl', ['$scope', '$rpt',
function($scope, $rpt) {
  $scope.state = "loading";
  $scope.reports = [];
  $rpt.loadReports(function(rpts){
      $scope.reports = rpts;
      $scope.state = 'loaded';
  });


  $scope.selectedOperationName = "";
  $scope.selectedOperation = null;

  $scope.reportData = [];
  $scope.reportHeaders = [];

  $scope.$watch('selectedOperationName', function(newValue, oldValue){
    $scope.reportData = [];
    $scope.reportHeaders = [];
    if(newValue === '' || newValue === null){
      $scope.selectedOperation = null;
      return;
    }
    $scope.selectedOperation = $scope.reports.filter(function(r){
      return r.operationId === newValue;
    })[0];
    if($scope.selectedOperation.parameters.length === 0){
      $scope.getReportData();
    }
  });

  $scope.getReportData = function() {
      $rpt.getReportData($scope.selectedOperation, function(headers, data){
        $scope.reportHeaders = headers;
        $scope.reportData = data;
      });
  };

  $scope.showReport = function(rpt, selectedOperationName){
    if(rpt.path.indexOf('Groups/{id}') === -1){
       return true;
     }
    var idParam = rpt.parameters.filter(function(p){return p.name === 'id';});
    if(idParam.length === 0) {
      return true;
    }
    return idParam[0].options.length > 0;

  };


}]);
