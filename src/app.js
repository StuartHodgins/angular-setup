"use strict";

angular.module('myApp', []);

angular.module('myApp').controller('MainController', ['$scope', '$interval', function($scope, $interval) {
//    console.log("Hello.");
    $scope.message = 'Hello';
    $scope.sayHello = function(name) {
        return $scope.message  + ' ' + name + '.';
    }
    var items = [ 'Rocky', 'Chase', 'Marshall', 
            'Rubble', 'Zuma', 'Skye'];
    $scope.pups = [ 'Rocky', 'Chase', 'Marshall', 'Rubble', 'Zuma', 'Skye'];
    
    $scope.itemIndex = 0;
    $scope.currentItem = '';
    
    $scope.getItem = function() {
        $scope.currentItem = items[$scope.itemIndex];
    }
    
    $interval(function() {
        $scope.itemIndex = Math.round( Math.random() * (items.length - 1));
        $scope.getItem();
        
    }, 2000);
    
    this.submitForm = function(form) {
        if (form.$valid) {
            window.alert('Passed.');
        } else {
            window.alert('Failed.');
        }
    };
    
}]);

angular.module('myApp').controller('ParentController', ['$scope', function($scope) {
    $scope.model =  {
      name: 'Chloë Breanna'  
    };
}]);
    
angular.module('myApp').controller('ChildController', [function() {
    this.accountTypeList = [ 'CHEQUING', 'SAVINGS', 'DAILY INTEREST', 'BEST RATE' ];

    this.user = {
        firstName: 'Hihn',
        lastName: 'Smyth',
        title: 'the duke of doubt',
        accountType: 'CHEQUING',
        balance: 1234.56,
        isActive: true
    };
    this.users = [
        {
            firstName: 'Alice',
            lastName: 'Apple',
            accountType: 'CHEQUING',
            balance: 1234.56,
            isActive: true
        },
        {
            firstName: 'Bob',
            lastName: 'Banana',
            accountType: 'SAVINGS',
            balance: 123.45,
            isActive: true
        },
        {
            firstName: 'Carol',
            lastName: 'Cucumber',
            accountType: 'DAILY INTEREST',
            balance: 12.34,
            isActive: true
        },
        {
            firstName: 'Ted',
            lastName: 'Tomato',
            accountType: 'SAVING',
            balance: 43.21,
            isActive: true
        }];
}]);
    

