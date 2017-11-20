app.directive('swipeReceiver', ['$document', '$timeout', '$swiperFactory', function ($document, $timeout, $swiperFactory) {
    return {
        scope: {
          enableSwipe: '=?',
          accountKey: '=?',
          encryptedAccount: '=?',
          account: '=?',
          mode: '=?'
        },
        restrict: 'E',
        replace: true,
        template: '<div><a ng-hide="enableSwipe" class="btn btn-primary" ng-click="enableSwipe=true" title="Click here to scan a card"><span><i class="fa fa-credit-card"></i> {{swipeMessage}}</span></a>'
                + '<span ng-show="enableSwipe"><i class="fa fa-credit-card"></i> {{swipeMessage}}</span></div>',
        link: function(scope, element, attrs) {
          scope.clearForm = function(){
            scope.accountKey = "";
            scope.encryptedAccount = "";
            scope.rawSwipe = "";
            scope.swipeMessage = "";
            scope.account = "";
          };

          scope.validateSwipe = function() {
            if(scope.rawSwipe.length < 16){
              return false;
            }

            if( scope.rawSwipe.substr(0, 2) !== "02"
              || scope.rawSwipe.substr(scope.rawSwipe.length-2, 2) !== "03"){
              return false;
            }
            return true;
          };
          scope.parseRawSwipe = function() {
            var swiper = $swiperFactory.getSwiper();
            var result = swiper.parseRawSwipe(scope.rawSwipe);


            if (!result.isSuccessful){
                scope.clearForm();
                scope.swipeMessage = result.message;
                return;
            }
            scope.accountKey = result.accountKey;
            scope.encryptedAccount = result.encryptedAccount;
            scope.account = result.account;
            scope.enableSwipe = false;
          };
          scope.clearForm();
          scope.$watch('enableSwipe', function(newVal, oldVal, scope){
            if(newVal){
              if(typeof(scope.clearForm) == 'function') {
                scope.clearForm();
              }
              scope.swipeMessage = "Swipe card now...";
            }else {
              scope.swipeMessage = 'Card Captured! ' + scope.account;
            }
          });
          $document.on('keypress', function(event) {
            var elementType = event.currentTarget.activeElement.type;
            if(!scope.enableSwipe || (elementType && elementType !== "")){
              return; // ignore until expression returns true
            }
            if(scope.rawSwipe === ''){
              scope.swipeMessage = "Processing Swipe...";
              $timeout(function() {
                if(scope.enableSwipe === false){
                  return; // return char was captured
                }
                if(scope.validateSwipe()){
                  scope.parseRawSwipe();
                  return;
                }
                scope.clearForm();
                scope.swipeMessage = "Error trying to swipe. Please try again.";
              }, 5000);
            }

            event.preventDefault();
            if(event.which === 13) { // On ENTER submit parent form
              if(scope.validateSwipe()){
                scope.parseRawSwipe();
                scope.$apply();
                return;
              }
              scope.clearForm();
              scope.swipeMessage = "Error trying to swipe. Please try again.";
            } else if(event.which === 27) {
              scope.clearForm();
              scope.enableSwipe = false;
            } else {
              scope.rawSwipe += String.fromCharCode(event.which);
            }
            scope.$apply();
          });
        }
      };
    }
  ]
);
