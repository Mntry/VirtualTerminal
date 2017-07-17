app.directive('modalDialog', ['$document', '$window', function($document, $window) {
  return {
    restrict: 'E',
    scope: {
      show: '=',
      printTitle: '@?'
    },
    replace: true, // Replace with the template below
    transclude: true, // we want to insert custom content inside the directive
    link: function(scope, element, attrs) {
      scope.dialogStyle = {};
      if (attrs.width)
        scope.dialogStyle.width = attrs.width;
      if (attrs.height)
        scope.dialogStyle.height = attrs.height;
      scope.hideModal = function() {
        scope.show = false;
      };

      var printDiv = $(element).find('#printDiv');
      scope.enablePrint = printDiv.length > 0;
      scope.print = function() {
        var content = printDiv.html();
        var title = scope.printTitle||'Print';
        var printWindow = $window.open('', title, 'height=600,width=800');
        printWindow.document.write('<html><head><title>'+title+'</title></head><body>');
        printWindow.document.write(content);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
    },
    template: '<div class="ng-modal" ng-show="show">'+
  '<div class="ng-modal-overlay" ng-click="hideModal()"></div>' +
  '<div class="ng-modal-dialog" ng-style="dialogStyle">' +
  '<button type="button" class="close" ng-click="hideModal()"><i class="pg-close fs-14"></i></button>' +
  '<div class="ng-modal-dialog-content" ng-transclude></div>' +
  '<a class="btn btn-primary btn-block" ng-show="enablePrint" ng-click="print()">Print</a>' +
  '</div></div>'
  };
}]);
