'use strict';

angular.module('android-addressbook', ['mongolab', 'helpers'])
	.config(function($compileProvider){
    		$compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
	})
	.config(['$routeProvider', function($routeProvider, $locationProvider) {
	  	$routeProvider.
			when('/contacts/', {templateUrl: 'tpl/contacts-list.html', controller: AddressBook.ListCtrl}).
			when('/contacts/starred', {templateUrl: 'tpl/contacts-starred.html', controller: AddressBook.ListCtrl}).
			when('/contacts/search', {templateUrl: 'tpl/contacts-search.html', controller: AddressBook.ListCtrl}).
			when('/contact/add', {templateUrl: 'tpl/contact-edit.html', controller: AddressBook.DetailCtrl}).
			when('/contact/view/:id', {templateUrl: 'tpl/contact-view.html', controller: AddressBook.DetailCtrl}).
			when('/contact/edit/:id', {templateUrl: 'tpl/contact-edit.html', controller: AddressBook.DetailCtrl}).

			otherwise({redirectTo: '/contacts'});
}]);
