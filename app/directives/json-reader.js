
app.directive('jsonReader', [function () {

    return {
        restrict: 'A',
        scope: {
            results: '=',
            callback: '&saveResultsCallback'
        },
        link: function (scope, element, attrs) {
            // When the file input changes
            element.on('change', function (e) {

                // Get our files
                var files = e.target.files;

                // If we have some files
                if (files && files.length) {

                    // Create our fileReader and get our file
                    var reader = new FileReader();
                    var file = (e.srcElement || e.target).files[0];

                    // Once the fileReader has loaded
                    reader.onload = function (e) {

                        // Get the contents of the reader
                        var contents = e.target.result;

                        // Apply to the scope
                        scope.$apply(function () {

                            // Our data after it has been converted to JSON
                            scope.results = JSON.parse(contents);

                            // Call our callback function
                            scope.callback(scope.results);
                        });
                    };

                    // Read our file contents
                    reader.readAsText(file);
                }
            });
        }
    };
}]);
