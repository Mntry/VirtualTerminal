app.directive('swipeReceiver', ['$document', function ($document) {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
          element.html('<i class="fa fa-credit-card"></i><span>Swipe card now...</span>');
          if (!attrs.accountKey){
            throw 'swipeReceiver directive requires accountKey attribute';
          }
          if(!attrs.encryptedAccount){
            throw 'swipeReceiver directive requires encryptedAccount attribute';
          }
          if(!attrs.enableSwipe){
            attrs.enableSwipe = true;
          }
          scope[attrs.accountKey] = "";
          scope[attrs.encryptedAccount] = "";
          $document.on('keypress', function(event) {
            if(!scope.$eval(attrs.enableSwipe) && scope[attrs.accountKey] != ''){
              return; // ignore until expression returns true
            }

            event.preventDefault();
            if(event.which == 13) { // On ENTER submit parent form
              $document.off('keypress');
              scope.process(scope.request);
            }
            else if (event.which == 27) // On ESC cancel swipe
            {
              scope.
              scope.cancelProcess();
            }
            else {
              scope.rawSwipe += String.fromCharCode(event.which);
            }
          });
        }
      }
    }
  ]
);
