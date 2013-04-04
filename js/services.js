'use strict';

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

angular.module('helpers', []).
    factory('Utils', function() {
		return {
			groupify : function(source, into) {
				var i, ch;
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