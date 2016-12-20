'use strict';
const ClientStatus = {
	connected : 0,
	named : 1,
	inLobby : 2,
	inGame : 3
};
class Client {
	constructor( socket, id, storage )
	{
		this.socket = socket;
		this.id = id;
		this.storage = storage;
		this.status = ClientStatus.connected;
		this.name = Buffer.assoc( 20 );
		this.socket.on( 'data', ( data ) =>
		{
			console.log( data );
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
}

module.exports.Client = Client;
module.exports.ClientStatus = ClientStatus;
