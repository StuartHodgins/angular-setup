
angular.module('myApp').filter('capitalize',function() {
   return function(value) {
       var result = null;
       var words = value.split(' ');
       // Use this list to skip Cap of words not normaly capped
       var nogo = [ 'and', 'or', 'the', 'of', 'by', 'a'];
       words.forEach(function(item) {
           if (result) {
               result += ' ';
           } else {
               result = '';
           }
           result += item.substr(0,1).toUpperCase() + item.substr(1).toLowerCase();
       });
       return result;
   };
 });
