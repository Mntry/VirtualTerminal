app.directive('swipeReceiver', ['$document', '$timeout', function ($document, $timeout) {
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
          scope.convertStrToBit
          scope.validateSwipe = function() {
            if(scope.rawSwipe.length < 16){
              return false;
            }

            if( scope.rawSwipe.substr(0, 2) != "02"
              || scope.rawSwipe.substr(scope.rawSwipe.length-2, 2) != "03"){
              return false;
            }
            return true;
          };
          scope.parseRawSwipe = function() {
            //todo: parse raw swipe details
            var raw = scope.rawSwipe;
            var stx = raw.substr(0,2);
            var lowByteTotal = raw.substr(2,2);
            var highByteTotal = raw.substr(4,2);
            var cardType = raw.substr(6,2);
            var isTrackGood = raw.substr(8,2);
            var track1Length = raw.substr(10,2);
            var track2Length = raw.substr(12,2);
            var track3Length = raw.substr(14,2);
            var featureMask = raw.substr(16,2);
            var hashStatusMask = raw.substr(18,2);
            var track1 = '';
            var track2 = '';
            var track3 = '';
            var encTrk1 = '';
            var encTrk2 = '';
            var encTrk3 = '';
            track1Length = parseInt("0X"+track1Length, 16);
            track2Length = parseInt("0X"+track2Length, 16);
            track3Length = parseInt("0X"+track3Length, 16);

            var encTrk1Length = (track1Length+(track1Length % 8))*2;
            var encTrk2Length = (track2Length+(track2Length % 8))*2;
            var encTrk3Length = (track3Length+(track3Length % 8))*2;

            featureMask = parseInt("0X"+featureMask, 16);
            hashStatusMask = parseInt("0X"+hashStatusMask, 16);

            if (isNaN(track1Length)
            || isNaN(track2Length)
            || isNaN(track3Length)
            || isNaN(featureMask)
            || isNaN(hashStatusMask)){
                scope.clearForm();
                scope.swipeMessage = 'Error reading card. please swipe again.';
                return;
            }

            var featureBits = featureMask.toString(2); // bits as char array!
            var hashBits = hashStatusMask.toString(2);

            var start = 20;
            track1 = raw.substr(start, track1Length);
            start += track1Length;
            track2 = raw.substr(start, track2Length);
            start += track2Length;
            track3 = raw.substr(start, track3Length);
            if(hashBits[0] == "1"){ //hashbits[0] == KSN included?
              start += track3Length;
              encTrk1 = raw.substr(start, encTrk1Length);
              start += encTrk1Length;
              encTrk2 = raw.substr(start, encTrk2Length);
              start += encTrk3Length;
              encTrk3 = raw.substr(start, encTrk3);

              scope.accountKey = raw.substr(raw.length-26,20);
              scope.encryptedAccount = encTrk2;
            }
            else if (scope.mode == 'Credit'){
              scope.clearForm();
              scope.swipeMessage = 'Configuration error. Swiper is not including KSN!';
              scope.accountKey = "";
              scope.encryptedAccount = "";
              return;
            }
            var account = track2.substr(0, track2.indexOf("?"));
            if(track2.indexOf("=") != -1){
              var account = track2.substr(0, track2.indexOf("="));
            }
            account = account.replace(";", "");
            if (account == ''){
              scope.clearForm();
              scope.swipeMessage = "Failed to read the card correctly. Please try agian.";
              return;
            }
            scope.account = account;
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
            if(!scope.enableSwipe || (elementType && elementType != "")){
              return; // ignore until expression returns true
            }
            if(scope.rawSwipe == ''){
              scope.swipeMessage = "Processing Swipe...";
              $timeout(function() {
                if(scope.validateSwipe()){
                  scope.parseRawSwipe();
                  return;
                }
                scope.clearForm();
                scope.swipeMessage = "Error trying to swipe. Please try again.";
              }, 5000);
            }

            event.preventDefault();
            if(event.which == 13) { // On ENTER submit parent form
              parseRawSwipe();
              scope.enableSwipe = false;
            } else if(event.which == 27) {
              clearForm();
              scope.enableSwipe = false;
            } else {
              scope.rawSwipe += String.fromCharCode(event.which);
            }
            scope.$apply();
          });
        }
      }
    }
  ]
);
