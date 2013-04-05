'use strict';

var AddressBook = (function() {

	var 
	iscroll,
	current_route,

	_init = function($scope) {
		iscroll = null;
		current_route = '/contacts';
	},

	_iScroll = function() {
		iscroll && iscroll.destroy();
		iscroll = new iScroll('wrapper', { hScroll: false });
		setTimeout(function() { 
			iscroll.refresh(); 
		}, 0);
	},

	_detail_ctrl = function($scope, $location, $routeParams, Utils, Contacts) {
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
			$location.path(current_route);
		}

		$scope.ProfileImage = function(dim) {
			return ($scope.contact && $scope.contact.picture) || "imgs/ic_contact_picture_"+dim+".png";
		}

		$scope.FullName = function(dim) {
			return ($scope.contact.firstName && $scope.contact.firstName.trim()) 
				? $scope.contact.firstName + ' ' + $scope.contact.lastName 
				: ($scope.contact._id ? 'No name' : 'New contact');
		}

		$scope.StarUnStar = function () {
			$scope.contact.starred = !$scope.contact.starred;
			$scope.contact.update();
	    }

	    $scope.AddField = function(type) {
	        $scope.contact[type] || ($scope.contact[type] = []);
	        $scope.contact[type].push({
                type: '',
                value: ''
	        });
	    }

	    $scope.DiscardField = function(type, index) {
	        if($scope.contact[type] && $scope.contact[type][index]) {
				$scope.contact[type].splice(index, 1);
	        }
	    }

		$scope.SaveContact = function () {
	        if($scope.contact.firstName && $scope.contact.firstName.trim()) {
	        	var arrays = {'phones': [], 'emails': [], 'addresses': []};
	        	angular.forEach(arrays, function(v, k) {
					angular.forEach($scope.contact[k], function(val, key) {
						if(val.value.trim()) {
							arrays[k].push(val);
						}
					});
					$scope.contact[k] = arrays[k];
				});

	        	if($scope.contact._id) {
	    			$scope.contact.update(function() {
						$location.path('/contact/view/' + $scope.contact._id.$oid);
					});
	        	}
	        	else {
					Contacts.save($scope.contact, function(contact) {
						$location.path('/contact/view/' + contact._id.$oid);
					});
				}
	        }
	    }

	    $scope.DeleteContact = function () {
	    	if($scope.contact._id) {
	    		var c = confirm("Delete this contact?")
				if (c==true) {
					self.original.delete(function() {
						$location.path('/contacts');
			    	});
				}
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

	_list_ctrl = function($scope, $location, $routeParams, Utils, Contacts) {
		var i, 
			ch, 
			self = this;

		$scope.orderProp = 'firstName';
	  	$scope.groups = {};
	  	$scope.contacts = {};
	  	$scope.starred = {};
	  	$scope.searchterm = '';

		$scope.ProfileImage = function(dim, contact) {
			return contact.picture ? contact.picture.replace("480x480", dim) : "imgs/ic_contact_picture_"+dim+".png";
		}

		$scope.Back = function() {
			$location.path(current_route);
		}

		switch($location.$$url) {
			case "/contacts/starred": 
				current_route = $location.$$url;
				$scope.starred = Contacts.query({q: '{"starred":true}'}, function() {
					$scope.contacts = Contacts.query({q: '{"views":{"$gt":0}}', l: 10}, function() {
					    _iScroll();
					});
				});
				break;

			case "/contacts/search": 
				$scope.contacts = Contacts.query(function() {
					$scope.groups = [{
						label: 'All contacts',
						contacts: $scope.contacts
					}];
				    _iScroll();
				});
				break;

			default:
				current_route = $location.$$url;
				$scope.contacts = Contacts.query(function() {
					Utils.groupify($scope.contacts, $scope.groups);
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