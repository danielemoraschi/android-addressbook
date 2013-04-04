window.log = function(){
	log.history = log.history || [];
	log.history.push(arguments);
	if(this.console) {
		console.log(Array.prototype.slice.call(arguments));
	}
};



var AddressBook = (function() {

	var 
	iscroll,
	last_view,

	_init = function($scope) {
		iscroll = null;
		last_view = '/contacts';
	},

	_iScroll = function() {
		iscroll && iscroll.destroy();
		iscroll = new iScroll('wrapper', { hScroll: false });
		setTimeout(function() { 
			iscroll.refresh(); 
		}, 0);
	},

	_detail_ctrl = function($scope, $location, $routeParams, utils, Contacts) {
		var self = this;
		$scope.selected = false;
		$scope.submenu = false;
		$scope.contact = {
			starred: false,
			firstName: "",
			lastName: "",
			birthday: "",
			picture: "",
			phones: [],
			emails: [],
			addresses: [],
			websites: [],
			notes: ""
		};

		$scope._showImage = function() {
			$scope.selected = !$scope.selected;
		}
		
		$scope._submenu = function() {
			$scope.submenu = !$scope.submenu;
		}

		$scope._isClean = function() {
			return angular.equals(self.original, $scope.contact);
		}

		$scope.Back = function() {
			$location.path(last_view);
		}

		$scope.ProfileImage = function(dim) {
			return ($scope.contact && $scope.contact.picture) || "imgs/ic_contact_picture_"+dim+".png";
		}

		$scope.FullName = function(dim) {
			return ($scope.contact.firstName.trim()) 
				? $scope.contact.firstName + ' ' + $scope.contact.lastName 
				: ($scope.contact._id ? 'No name' : 'New contact');
		}

		$scope.StarUnStar = function () {
			$scope.contact.starred = !$scope.contact.starred;
			$scope.contact.update();
	    }

		$scope.SaveContact = function () {
	        if($scope.contact.firstName.trim()) {
	        	if($scope.contact._id.$oid) {
	    			$scope.contact.update(function() {
						$location.path('/contact/view/' + $scope.contact._id.$oid);
					});
	        	}
	        	else {
					Contacts.save($scope.contact, function(contact) {
						$location.path('/contact/edit/' + contact._id.$oid);
					});
				}
	        }
	    }

	    $scope.DeleteContact = function () {
	    	if($scope.contact._id.$oid) {
				self.original.delete(function() {
					$location.path('/contacts');
		    	});
			}
	    }

		if($routeParams.id) {
			Contacts.get({id: $routeParams.id}, function(contact) {
				self.original = contact;
				if(!self.original.views) {
					self.original.views = 0;
				}
				self.original.views++;
			    $scope.contact = new Contacts(self.original);
				$scope.contact.update();
				_iScroll();
			});
		} else {
			_iScroll();
		}
	},

	_list_ctrl = function($scope, $location, $routeParams, utils, Contacts) {
		var i, 
			ch, 
			self = this;

		$scope.orderProp = 'firstName';
	  	$scope.groups = {};
	  	$scope.contacts = {};
	  	$scope.starred = {};
	  	$scope.searchterm = '';

		$scope.ProfileImage = function(dim, contact) {
			return contact.picture || "imgs/ic_contact_picture_"+dim+".png";
		}

		$scope.Back = function() {
			$location.path(last_view);
		}

		switch($location.$$url) {
			case "/contacts/starred": 
				last_view = $location.$$url;
				$scope.starred = Contacts.query({q: '{"starred":true}'}, function() {
					$scope.contacts = Contacts.query({q: '{"views":{"$gt":0}}', l: 10}, function() {
					    _iScroll();
					});
				});
				break;

			case "/contacts/search": 
	  			//var q = '{"$or":[{"firstName":{"$regex": "'+$scope.searchterm+'","$options": "i"}},{"lastName": {"$regex": "'+$scope.searchterm+'","$options": "i"}}]}';
				$scope.contacts = Contacts.query(function() {
					$scope.groups = [{
						label: 'All contacts',
						contacts: $scope.contacts
					}];
				    _iScroll();
				});
				break;

			default:
				last_view = $location.$$url;
				$scope.contacts = Contacts.query(function() {
					utils.groupify($scope.contacts, $scope.groups);
				    _iScroll();
				});
				break;
		}
	};


	return {
		Init: _init,
		DetailCtrl: _detail_ctrl,
		ListCtrl: _list_ctrl
	}

})();







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
			when('/contacts/', {templateUrl: 'tpl/contacts-list.html', controller: AddressBook.ListCtrl}).
			when('/contacts/starred', {templateUrl: 'tpl/contacts-starred.html', controller: AddressBook.ListCtrl}).
			when('/contacts/search', {templateUrl: 'tpl/contacts-search.html', controller: AddressBook.ListCtrl}).
			when('/contact/add', {templateUrl: 'tpl/contact-edit.html', controller: AddressBook.DetailCtrl}).
			when('/contact/view/:id', {templateUrl: 'tpl/contact-view.html', controller: AddressBook.DetailCtrl}).
			when('/contact/edit/:id', {templateUrl: 'tpl/contact-edit.html', controller: AddressBook.DetailCtrl}).

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


