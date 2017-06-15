var app = angular.module('mVirtualTerminal', ['ui.bootstrap']);

app.run(function ($rootScope, $http) {
  $rootScope.request = {}
  $rootScope.data = {};
  $rootScope.trancode = '';
  $rootScope.api = { url: localStorage.api_url || '' };
  $rootScope.header = { Authorization: localStorage.authorization || '' };
	if (sessionStorage.transactions === undefined) {
		sessionStorage.transactions = '';
	};
	$rootScope.history = JSON.parse('[' + sessionStorage.transactions + ']');
});

app.controller('mCtrl', function ($scope, $modal) {
    $scope.open = function (templateUrl, size, backdrop) {
        $modal.open({
            templateUrl: templateUrl,
            controller: 'modalCtrl',
            size: size,
            backdrop: backdrop
        });
    };
});

app.controller('modalCtrl', function ($rootScope, $scope, $document, $http, $modal, $modalInstance, $window) {
    $scope.process = function (request, trancode, path) {
		    $rootScope.data = {};
        // POST
        var req = {
            method: 'POST',
            url: $scope.api.url + '/storedvalue/' + $scope.trancode + '/' + path,
            headers: $scope.header,
            data: request
        }
        $http(req).success(function (data) {
  			$scope.data.response = data;
  			if (data.reference != null) {
  				if (sessionStorage.transactions != '') {
  					sessionStorage.transactions = ',' + sessionStorage.transactions;
  				}
  				sessionStorage.transactions = JSON.stringify(data) + sessionStorage.transactions;
  				$rootScope.history = JSON.parse('[' + sessionStorage.transactions + ']');
  			}
  		}).
  		error(function (data) {
  			$scope.data.response = data;
  		});

      $modalInstance.dismiss('process');

      $modal.open({
          templateUrl: 'response.html',
          controller: 'modalCtrl',
          size: 'sm',
          backdrop: 'static'
      });
    };

    $scope.cancelProcess = function () {
      $document.off('keypress');
      $modalInstance.dismiss('cancel');
      $rootScope.request = {};
    };

    $scope.save = function () {
      // save to local storage
      localStorage.api_url = $scope.api.url;
      localStorage.authorization = $scope.header.Authorization;
      $modalInstance.dismiss('save');
    };

    $scope.cancelSave = function () {
      // revert to stored values
      $modalInstance.dismiss('cancel');
      $scope.api.url = localStorage.api_url || '';
      $scope.header.Authorization = localStorage.authorization || '';
    };

    $scope.ok = function () {
      $modalInstance.dismiss('cancel');
      $rootScope.request = {};
    };

    $scope.void = function (reference) {
		$scope.process('', 'sale', reference + '/void');
    };

    $scope.voided = function (reference, voided_id) {
      if (voided_id !== undefined || $scope.history.some(function (elem) {
			     return elem.voided_id === reference;
			})) {
        return true;
      }
		  else {
        return false;
      }
    };

});

app.directive('swipeReceiver', ['$document', function ($document) {
    return {
        link: function(scope) {
          scope.request.track2 = "";
          $document.on('keypress', function(event) {
            event.preventDefault();
            if(event.which == 13) { // On ENTER submit parent form
              $document.off('keypress');
              scope.process(scope.request, scope.trancode, '');
            }
            else if (event.which == 27) // On ESC cancel swipe
            {
              scope.cancelProcess();
            }
            else {
              scope.request.track2 += String.fromCharCode(event.which);
            }
          });
        }
      }
    }
  ]
);
