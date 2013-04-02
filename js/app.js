window.log = function(){
	log.history = log.history || [];
	log.history.push(arguments);
	if(this.console) {
		console.log(Array.prototype.slice.call(arguments));
	}
};

angular.module('mongolab', ['ngResource']).
    factory('Contacts', function($resource) {
		var Contacts = $resource('https://api.mongolab.com/api/1/databases/addressbook/collections/contacts/:id',
			{ apiKey: 'RO27EEbdFsJfycTn_JUiAnr3qIcsgyxS' }, {
				update: { method: 'PUT' }
			}
		);
 
      	Contacts.prototype.update = function(cb) {
        	return Contacts.update({id: this._id.$oid},
            	angular.extend({}, this, {_id:undefined}), cb);
      	};
 
      	Contacts.prototype.delete = function(cb) {
        	return Contacts.remove({id: this._id.$oid}, cb);
      	};
 
      	return Contacts;
    });


var app = angular.module('addressbook', ['mongolab']).
	config(['$routeProvider', function($routeProvider, $locationProvider) {
	  	$routeProvider.
			when('/contacts', {templateUrl: 'tpl/contacts-list.html', controller: AddressBookCtrl}).
			when('/contacts/starred', {templateUrl: 'tpl/contacts-list.html', controller: StarredCtrl}).
			when('/contact/add', {templateUrl: 'tpl/contact-edit.html', controller: CreateCtrl}).
			when('/contact/view/:id', {templateUrl: 'tpl/contact-view.html', controller: DetailCtrl}).
			when('/contact/edit/:id', {templateUrl: 'tpl/contact-edit.html', controller: DetailCtrl}).
			otherwise({redirectTo: '/contacts'});
}]);


app.factory('utils', function() {
	return {
		groupify : function(source, into) {
		  	for (i = source.length - 1; i >= 0; i--) {
				ch = source[i].firstName.charAt(0);
				into[ch] || (into[ch] = {
					label: ch,
					contacts: []
				});
				into[ch].contacts.push(source[i]);
			};
		}
	}
});


var _scroll;

function CreateCtrl($scope, $location, Contacts) {
	$scope.save = function() {
		$location.path('/contact/view/' + $scope.contact._id.$oid);
		/*Contacts.save($scope.contact, function(contact) {
			$location.path('/contact/edit/' + contact._id.$oid);
		});*/
	}
}

function DetailCtrl($scope, $location, $routeParams, utils, Contacts) {
	var self = this;
	$scope.selected = false;

	Contacts.get({id: $routeParams.id}, function(contact) {
		self.original = contact;
	    $scope.contact = new Contacts(self.original);

	    _scroll = new iScroll('wrapper', {hScroll: false});
		setTimeout(function () { _scroll.refresh(); }, 0);
	});

	$scope.showImage = function() {
		$scope.selected = !$scope.selected;
	}

	$scope.saveContact = function (contact) {
        $scope.contact.update(function() {
			$location.path('/contact/view/' + $scope.contact._id.$oid);
		});
    }

    $scope.isClean = function() {
		return angular.equals(self.original, $scope.contact);
	}

	$scope.starred = function () {
		$scope.contact.starred = !$scope.contact.starred;
		$scope.contact.update();
    }

    $scope.deleteContact = function () {
		/*self.original.delete(function() {
			$location.path('/contacts');
    	});*/
    }

    $scope.addNew = function(type) {
    	$scope.contact[type] || ($scope.contact[type] = []);
    	$scope.contact[type].push({
    		type: '',
    		value: ''
    	});
    }

    $scope.discard = function(type, index) {
    	log(index);
    	if($scope.contact[type] && $scope.contact[type][index]) {
    		$scope.contact[type].splice(index,1);

    	}
    }
}

function StarredCtrl($scope, utils, Contacts) {
	var i, ch;
	$scope.orderProp = 'firstName';
  	$scope.groups = {};
	$scope.contacts = Contacts.query({q: '{"starred":true}'}, function() {
	  	utils.groupify($scope.contacts, $scope.groups);
	    _scroll = new iScroll('wrapper', {hScroll: false});
		setTimeout(function () { _scroll.refresh(); }, 0);
	});
}

function AddressBookCtrl($scope, utils, Contacts) {
	var i, ch;
	$scope.orderProp = 'firstName';
  	$scope.groups = {};
	$scope.contacts = Contacts.query(function() {
		utils.groupify($scope.contacts, $scope.groups);
	    _scroll = new iScroll('wrapper', {hScroll: false});
		setTimeout(function () { _scroll.refresh(); }, 0);
	});
}





