'use strict';
const ClientStatus = {
	connected : 0,
	named : 1,
	inLobby : 2,
	inGame : 3
};
const Request = require( './Request' );
const Response = require( './Response' );
class Client {
	constructor( socket, id, storage )
	{
		this.socket = socket;
		this.id = id;
		this.storage = storage;
		this.status = ClientStatus.connected;
		this.name = Buffer.alloc( 20 );
		this.response = new Response( socket );
		this.request = new Request( this, this.response );
		this.room = null;
		this.socket.on( 'data', ( data ) =>
		{
			this.request.handleRequest( data );
		} );
		this.socket.on( 'error', () =>
		{
		} );
		this.socket.on( 'close', () =>
		{
			this.storage.removeClient( this.id );
		} );
	}

	setName( data )
	{
		if( this.storage.addName( data.nick ) )
		{
			if( this.status === ClientStatus.named )
			{
				if( !this.storage.removeName( this.name ) )
				{
					return false;
				}
			}
			this.name = data.nick;
			this.status = ClientStatus.named;
			return true;
		}
		return false;
	}

	listGames()
	{
		return this.storage.listAvailableGames();
	}

	createRoom( data )
	{
		if( this.room === null )
		{
			let room = this.clientsStorage.addRoom( {
				name : data.name,
				password : data.password
			}, this );
			if( room !== false )
			{
				this.room = room;
				return true;
			}
		}
		return false;
	}

	leaveLobby()
	{
		if( this.room !== null )
		{
			this.room.leave( this.id );
			return true;
		}
		return false;
	}

}

module.exports.Client = Client;
module.exports.ClientStatus = ClientStatus;
