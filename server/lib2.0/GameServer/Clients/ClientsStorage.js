'use strict';
const Client = require( './Client' );
class ClientsStorage {

	constructor()
	{
		this.clients = [];
	}

	getClientsCount()
	{
		return this.clients.length;
	}

	addClient( socketWrite )
	{
		this.clients.push( new Client( socketWrite ) );
	}
}

module.exports = ClientsStorage;
