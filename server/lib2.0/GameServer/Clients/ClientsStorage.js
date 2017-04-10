'use strict';
const Client = require( './Client' );
const UniqueKeyGenerator = require( '../Helpers/UniqueKeyGenerator' );
const UniqueNameStorage = require( '../Helpers/UniqueNameStorage' );
class ClientsStorage {

	constructor()
	{
		this.clients = [];
		this.uniqueKeyGenerator = new UniqueKeyGenerator( 4 );
		this.uniqueNameStorage = new UniqueNameStorage( 20, 'Anonymous' );
	}

	getUniqueNameStorage()
	{
		return this.uniqueNameStorage;
	}

	getClientsCount()
	{
		return this.clients.length;
	}

	addClient( socketWrite, server )
	{
		let index = this.clients.push( new Client( socketWrite, server, this ) ) - 1;
		let id = this.uniqueKeyGenerator.generateKey();
		this.clients[ index ].setId( id );
		return this.clients[ index ].getCallbacks();
	}
}

module.exports = ClientsStorage;
