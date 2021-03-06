"use strict";

angular.module('myApp', []);

angular.module('myApp').controller('myController', ['$scope', '$http', '$interval', function($scope, $http, $interval) {

    // This is global so that multiple requests can amend it.  
    var nodes = [];
    // Make it available to the page
    $scope.nodes = nodes;

    /** 
     * Basic error handling for the parser.
     * Currently just looks for an empty response and assumes that means that
     * our http get was rejected because cross-site scripting  is not enabled.  
     * @param data - response object
     */
    var errorCallback = function (data) {
        // Maybe we can't do cross-site scripting?
        if (data.status == -1) {
            console.log( "http get failed with no status. Is cross-site scripting enabled?");
        } else {
            /// Something else is wrong
            console.log("Message: " + data);
            console.log("Status: " + status); 
        }
    }

    /** 
     * Scan an HTML string for the Reputation Graph error text that indicates missing or bad credentials. 
     * @param innerHTML - HTML string to scan
     */
    function checkForCredentialProblem(innerHTML) {
        // Could not find the expected tags in the HTML. All that follows is an error check.
        // Maybe we're not logged in? Check for the relevant error string.
        
        // Pending a patch to put the error in a <p> tag we need to search the <div> tags. 
        var e2divs = $('div', innerHTML);
        if(e2divs.length > 0) {
            /* mainbody should always be present and is close to the top,
                4th in my tests, but we should not rely on this sposition 
                as the outer content could change. If we don't find it at
                all, that's OK. No need to error check the error check here. */  
            // Find mainbody and look inside for 'you are not allowed to see it'
            for (var i = 0; i < e2divs.length; i++) {
                if (e2divs[i].id == 'mainbody') {
                    if (e2divs[i].innerText.indexOf("you are not allowed to see it") != -1) {
                        console.log("You cannot get the reputation data. " + 
                                    "You are not logged in or your credentials are bad.");
                    } else if (e2divs[i].innerText.indexOf("You can only view the reputation graph for writeups") != -1) {
                        console.log("This is not a writeup."); 
                    } else {
                        console.log("Unknown problem: mainbody div says: " + e2divs[i].innerText);
                    }
                    break;
                }
            }
        } else {
            console.log('Unknown page problem: No or not enough anchor tags found.');
        }
    }

    /** 
     * Scan an HTML string for the Title and Author anchor tags, and extract the corrresponding strings. 
     * @param innerHTML - HTML string to scan
     * @returns {Array} - a two element array with Title and Author, or null if they are not found. 
     */
    var parseTitleAndAuthorInfo = function (innerHTML) {
        // Find the paragraphs to get the node title and author.
        var nodeTitle = '';
        var nodeAuthor = '';

        var paragraphs = $('p', innerHTML);
        if (paragraphs.length > 0) {
/*
            console.log(paragraphs[0]);     // Debug line     
*/
            // Get the anchors to parse the data from the first paragraph. 
            var anchors = $('a', paragraphs[0]);
            if (anchors.length > 1) {
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
                // Could not find the expected anchor tags. All that follows is an error check.
                // Maybe we're not logged in? Check for the relevant error string.
                // It might also be a bad node ID.
                checkForCredentialProblem(innerHTML);
                return null;
            }
        } else {
            console.log('no <p> tags found.');
            return null;
        }
        return [nodeTitle, nodeAuthor];
    }

    /** 
     * Scan an HTML string for the reputation data. 
     * @param innerHTML - HTML string to scan
     * @returns {Array} - a three element array with downvotes, upvotes, and reputation 
     */
    var parseReputationData = function (innerHTML) {
        // Now parse the rep table to get the final entry.
        // Get all of the table cell elements, so we can find the DateLabels
        var tablecells = $('td', innerHTML);
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
        return [downvotes, upvotes, rep];
    }

    /** 
     * Takes the http get response and parses if for the data we need. 
     * Currently just looks for an empty response and assumes that means that
     * our http get was rejected because cross-site scripting  is not enabled.  
     * @param response - response object
     */
    var parseData = function (response) {
        var tmp = document.implementation.createHTMLDocument();
        tmp.body.innerHTML = response.data;

        // Check that a Reputation Graph page was loaded.
        var headers = $('h1', tmp.body.innerHTML);
        if((headers.length == 0) || !angular.equals(headers[0].innerText,"Reputation Graph")) {
            console.log("http get target was not an e2 Reputation Graph page.");
            return null;
        }

        // Find the paragraphs to get the node title and author.
        var nodeData = parseTitleAndAuthorInfo(tmp.body.innerHTML);
        if (nodeData == null) {
            // Something is wrong, it should already be logged, exit
            console.log("Error parsing: " + response.config.url);
            return null; 
        }

        // Now parse the rep table to get the final entry.
        var repData = parseReputationData(tmp.body.innerHTML);

        // Set up the data elements for the HTML page.
        var node = {
            Title: nodeData[0],
            Author: nodeData[1],
            Downvotes: repData[0],
            Upvotes: repData[1],
            Rep: repData[2]
        };
        nodes.push(node);
    }

    // These are the IDs of the everything2 nodes for the 'Lost Gems 2' quest. 
    var node_ids = [2032386, 2055373, 2036540, 
                    2112225, 2116484, 2115813, 2122985, 2061920,
                    2056831, 2063834, 2065581, 2109231, 2008232, 
                    2030381, 
//                    8933, //  node ID of a user, tests code to handle bad IDs that are not for writeups      
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
        $http.get('http://everything2.net/node/superdoc/Reputation+Graph?id='+node_ids[i]).then(parseData, errorCallback);
}

    // The form does nothing. Why? To look at later, if the need arises.
    this.submitForm = function(form) {
        if (form.$valid) {
            window.alert('Passed.');
        } else {
            window.alert('Failed.');
        }
    };

}]);

   

