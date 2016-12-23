'use strict';

const Status = {
	uninitialized : 0,
	waitingForPlayers : 1,
	waitingForConfirming : 2,
	inGame : 3
};
const SearchEngine = require( './../Utils/SearchEngine' );
class Room {
	constructor( settings, client, id, storage )
	{
		this.id = id;
		this.name = settings.name;
		this.admin = client.id;
		this.storage = storage;
		this.clients = [];
		this.clients.push( client );
		this.status = Status.uninitialized;
	}

	leave( id )
	{
		if( this.status < Status.inGame )
		{
			if( id == this.admin )
			{
				this.storage.removeRoom( this.id );
				let adminIndex = SearchEngine.findByUniqueID( this.clients, id );
				if( adminIndex !== false && adminIndex !== -1 )
				{
					this.clients.splice( adminIndex, 1 );
				}
				let reason = Buffer.alloc( 30 );
				reason.write( 'Admin left lobby!' );
				this.clients.forEach( ( element ) =>
				{
					element.response.send( {
						opcode : 0x04,
						reason : reason
					} );
				} );
			}
			else
			{
				let index = SearchEngine.findByUniqueID( this.clients, id );
				if( index !== false && index !== -1 )
				{
					this.clients.splice( index, 1 );
					if( this.status === Status.waitingForConfirming )
					{
						this.status = Status.waitingForPlayers;
					}
				}
			}
		}
		else
		{
			let index = SearchEngine.findByUniqueID( this.clients, id );
			if( index !== false && index !== -1 )
			{
				this.clients.splice( index, 1 );
			}
		}

	}

	isAvailable()
	{
		if( this.status === Status.waitingForPlayers )
		{
			return {
				name : this.name,
				id : this.id
			};
		}
		else
		{
			return false;
		}
	}
}

module.exports = Room;
