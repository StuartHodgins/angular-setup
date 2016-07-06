"use strict";

angular.module('myApp', []);

angular.module('myApp').controller('myController', ['$scope', '$http', '$interval', function($scope, $http, $interval) {
    console.log("Hello.");

    // This is global so that multiple requests can amend it.  
    var nodes = [];
    // Make it available to the page
    $scope.nodes = nodes;

    // This callback gets the response element so we can parse it.
    var parseData = function (response) {
        var tmp = document.implementation.createHTMLDocument();
        tmp.body.innerHTML = response.data;

        // Find the paragraphs to get the node title and author.
        var nodeTitle = '';
        var nodeAuthor = '';
        // This relies on our target content being in the first paragraph, 
        // which feels fragile but it's good enough for this task.
        // If that changes, we could scan the paragraph list for the
        // text starting with "You are viewing" to isolate this data.  
        var paragraphs = $('p', tmp.body.innerHTML);
        if (paragraphs.length > 0) {
/*
            console.log(paragraphs[0]);     // Debug line     
*/
            // Get the anchors to parse the data from the first paragraph. 
            var anchors = $('a', paragraphs[0]);
            if (anchors.length>1) {
/*                            
                // Debug lines
                console.log(anchors[0]);
                console.log(anchors[1]);
*/                            
                // The first anchor should be the node title,
                // and the second should be the author.
                // For Title we need to strip the node type off,
                // which is a suffix in parenthesis. 
                // This code assumes the suffix has the only open-parens.
                var res = anchors[0].innerText.split('(');
                // If we get more than two elements of res we log it as a possible parse error.
                if (res.length > 2) {
                    console.log( 'Found ' + res.length-1 + 'open-parens in title, expected just one.');
                }
                // We'll end up with a trialing space that we do not want, trim it.
                nodeTitle = res[0].trim();
                // Author shoud be OK as-is, although with e2 one never knows for sure.
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
//                   for (var i = 0; i < tablecells.length; i++) {
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
 
 
//                    for (var i = 0; i < items.length; i++) {
            var node = {
                Title: nodeTitle,
                Author: nodeAuthor,
                Downvotes: downvotes,
                Upvotes: upvotes,
                Rep: rep
            };
            console.log(node);
            nodes.push(node);
//                    }

    }

      var node_ids = [2032386, 2055373, 2036540, 
                        2112225, 2116484, 2115813, 2122985, 2061920,
                        2056831, 2063834, 2065581, 2109231, 2008232, 
                        2030381,
                         534168, 2019135, 2054289, 
                        2125488, 2026515, 2055167, 2115593, 2016434,
                        2034240, 2112846, 2009696, 2073390, 2106213,
                        2108765, 2047133, 1185356, 2110635, 1961518,
                        2026781,
                        2034811, 2053661, 2102210, 2105039, 2014146
                        ];

    // When the http get resolves, the response is passed to our callback function. 
    // We could optionally add another error handling callback, if required.
    var i = 0;
    for (i=0; i<node_ids.length; i++) {
        $http.get('http://everything2.net/node/superdoc/Reputation+Graph?id='+node_ids[i]).then(parseData);
}

    this.submitForm = function(form) {
        if (form.$valid) {
            window.alert('Passed.');
        } else {
            window.alert('Failed.');
        }
    };

}]);

   

