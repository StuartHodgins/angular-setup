(function () {
 
    var scraperService = function ($http) {
 
        return {
 
            login: function (username, password) {
                var request = {
                    method: 'POST',
                    url: 'http://www.everything2.net',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: 'user=' + username + '&passwd=' + password // + '&RememberMe=true'
                };
 
                return $http(request);
            },
 /*
            getMyDinners: function () {
 
                var parseDinners = function (response) {
 
                    var tmp = document.implementation.createHTMLDocument();
                    tmp.body.innerHTML = response.data;
 
                    var items = $(tmp.body.children).find('.upcomingdinners li');
 
                    var dinners = [];
                    for (var i = 0; i < items.length; i++) {
                        var dinner = {
                            Name: $(items[i]).children('a')[0].innerText,
                            Date: $(items[i]).children('strong')[0].innerText
                        };
                        dinners.push(dinner);
                    }
 
                    return dinners;
                }
 
                return $http.get('http://www.nerddinner.com/Dinners/My')
                            .then(parseDinners);
            }
*/            
        }
    };
 
    var myController = function ($scope, $http, scraperService) {
 
        $scope.doLogin = function () {
 
            var onSuccess = function (response) {
                console.log("Login OK!");
 
/* 
                dinnerService.getMyDinners().then(
                function (response) {
                    $scope.dinners = response;
 
                });
 */
 
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