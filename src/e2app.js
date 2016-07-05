(function () {
 
    var scraperService = function ($http) {
 
        return {
 
            login: function (username, password) {
                var request = {
                    method: 'POST',
                    url: 'file:///D:/projects/data/Reputation%20Graph%20-%20Everything2.com.htm',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
//                    data: 'user=' + username + '&passwd=' + password // + '&RememberMe=true'
//                    data: 'id: 2055373'
                };
 
                return $http(request);
            },
 
            getMyDinners: function () {
 
                var parseDinners = function (response) {
 
                    var tmp = document.implementation.createHTMLDocument();
                    tmp.body.innerHTML = response.data;

//                    var items = $(tmp.body).find('.upcomingdinners li');
                    var innertxt = tmp.body.innerHTML;
//                    var santxt = innertxt.getElementsByTagName( 'td');
                    // Get all of the table cell elements, so we can find the DateLabels
                    var tablecells = $('td', innertxt);
                    var downvotes = '';
                    var upvotes = '';
                    var rep = '';

                    // We want the last DateLabel in the set. There could be a lot.
                    // The page has other tables and cells which we need to pass by on the way up.
                    // None of the other tables are expected to have DateLabel class elements.
                   for (var i = tablecells.length-1; i>=0; i--) {
//                   for (var i = 0; i < tablecells.length; i++) {
                        if (tablecells[i].className == 'DateLabel') {
                            // For simplicity we rely on the table row structure:
                            //  DateLabel, DownvoteLabel, DownvoteGraph, 
                            //  UpvoteGraph, Upvotelabel, ReputationLabel
                            downvotes = tablecells[i+1].innerText;
                            upvotes = tablecells[i+4].innerText;
                            rep = tablecells[i+5].innerText;
                            // Debug lines
                            console.log(tablecells[i]);
                            console.log(tablecells[i+1]);
                            console.log(tablecells[i+4]);
                            console.log(tablecells[i+5]);
                            break;
                       }
                   }
 
 
 //                   var items = $(tmp.body).find('.upcomingdinners li');
 
                    var dinners = [];
//                    for (var i = 0; i < items.length; i++) {
                        var dinner = {
                            Downvotes: downvotes,
                            Upvotes: upvotes,
                            Rep: rep
                        };
                        dinners.push(dinner);
//                    }
 
                    return dinners;
                }
 
/*                return $http.get('file:///D:/projects/data/Reputation%20Graph%20-%20Everything2.com.htm')
                            .then(parseDinners); */
                // Test for SCP-384, admin user must already be logged in.
                return $http.get('http://everything2.net/node/superdoc/Reputation+Graph?id=2032386')
                            .then(parseDinners);                     
            }
            
        }
    };
 
    var myController = function ($scope, $http, scraperService) {
 
        var node_ids = [2032386, 2055373, 2036540, 
                        2112225, 2116484, 2115813, 2122985, 2061920,
                        2056831, 2063834, 2065581, 2109231, 2008232, 
                        2030381,
                         534168, 2019135, 2054289, 
                        2125488, 2026515, 2055167, 2115593, 2016434,
                        2034240, 2112846,
                        2108765, 2047133, 1185356,
                        2026781
                        ];

        $scope.doLogin = function () {
 
            var onSuccess = function (response) {
                console.log("Login OK!");
 
                scraperService.getMyDinners().then(
                function (response) {
                    $scope.dinners = response;
 
                });
 
            };
 
            scraperService.login($scope.username, $scope.password)
                         .then(onSuccess);
        }
 
    };
 
    var myApp = angular.module('myApp', []);
 
    myApp.config(function ($httpProvider) {
        $httpProvider.defaults.withCredentials = true;
    });
 
    myApp.factory('scraperService', ['$http', scraperService]);
    myApp.controller('myController', ['$scope', '$http', 'scraperService', myController]);
 
})();