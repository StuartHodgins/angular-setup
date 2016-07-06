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
 
            getMyData: function (id) {
 
                var parseData = function (response) {
 
                    var tmp = document.implementation.createHTMLDocument();
                    tmp.body.innerHTML = response.data;
                    // Is it faster to avoid de-referencing repeatedly? 
                    // var innertxt = tmp.body.innerHTML;

                    var nodeTitle = '';
                    var nodeAuthor = '';

                    // Find the paragraphs to get the node title and author.
                    // This relies on our content being in the first paragraph, 
                    // which feels fragile but it's good enough for this task.
                    // If we had to, we could scan the paragraph list for the
                    // text starting with "You are viewing" to isolate this data.  
                    var paragraphs = $('p', tmp.body.innerHTML);
                    if (paragraphs.length>0) {
/*
                        // Debug lines
                        console.log(paragraphs[0]);     
*/
                        // Now get the anchors to get the data 
                        var anchors = $('a', paragraphs[0]);
                        if (anchors.length>1) {
/*                            
                            // Debug lines
                            console.log(anchors[0]);
                            console.log(anchors[1]);
*/                            
                            // First anchor should be node title, second should be author
                            // nodeTitle = anchors[0].innerText;
                            // Strip the node type off, assumes this is the only open-parens
                            var res = anchors[0].innerText.split('(');
                            nodeTitle = res[0].trim();
                            nodeAuthor = anchors[1].innerText;
                        } else {
                            console.log('not enough anchor tags found.');
                        }
                    } else {
                        console.log('no <p> tags found.');
                    }

                    // Now parse the rep table to get the final entry.
                    // Get all of the table cell elements, so we can find the DateLabels
                    var tablecells = $('td', tmp.body.innerHTML);
                    var downvotes = '';
                    var upvotes = '';
                    var rep = '';

                    // We want the last DateLabel in the set. There could be a lot.
                    // The page has other tables and cells which we need to pass by on the way up.
                    // None of the other tables are expected to have DateLabel class elements.
                   for (var i = tablecells.length-1; i>=0; i--) {
                       if (tablecells[i].className == 'DateLabel') {
                            // For simplicity we rely on the table row structure:
                            //  DateLabel, DownvoteLabel, DownvoteGraph, 
                            //  UpvoteGraph, Upvotelabel, ReputationLabel
                            downvotes = tablecells[i+1].innerText;
                            upvotes = tablecells[i+4].innerText;
                            rep = tablecells[i+5].innerText;
/*                            
                            // Debug lines
                            console.log(tablecells[i]);
                            console.log(tablecells[i+1]);
                            console.log(tablecells[i+4]);
                            console.log(tablecells[i+5]);
*/                            
                            break;
                       }
                   }
 
                     var nodes = [];
//                    for (var i = 0; i < items.length; i++) {
                        var node = {
                            Title: nodeTitle,
                            Author: nodeAuthor,
                            Downvotes: downvotes,
                            Upvotes: upvotes,
                            Rep: rep
                        };
                        nodes.push(node);
//                    }
 
                    return nodes;
                }
 
                // Test for SCP-384, admin user must already be logged in.
                return $http.get('http://everything2.net/node/superdoc/Reputation+Graph?id='+id)
                            .then(parseData);                     
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
                        2034240, 2112846, 2009696, 2073390, 2106213,
                        2108765, 2047133, 1185356, 1948812, 1961518,
                        2026781,
                        2034811, 2053661, 2102210, 2105039, 2014146
                        ];

        $scope.doLogin = function () {
 
            var onSuccess = function (response) {
                console.log("Login OK!");

                scraperService.getMyData(node_ids[1]).then(
                function (response) {
                    $scope.nodes = response;
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