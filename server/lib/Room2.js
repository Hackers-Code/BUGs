const Status = {
	uninitialized : 0,
	waitingForPlayers : 1,
	waitingForConfirming : 2,
	inGame : 3
};

const fs = require( 'fs' );

class Room {
	constructor( settings, client, id )
	{
		this.id = id;
		this.name = settings.name;
		this.password = settings.password;
		this.adminID = client.getID();
		this.clients = [];
		this.clients.push( client );
		this.mapID = 1;
		this.maxPlayers = 2;
		this.status = Status.uninitialized;
		this.playersList = null;
		this.wormsList = {
			worms_count : Buffer.from( [
				0,
				0,
				0,
				0
			] ),
			worms : []
		};
	}

	setConfig( id, config )
	{
		if( id.compare( this.adminID ) === 0 )
		{
			this.mapID = config.mapID.readInt32BE( 0 );
			if( !fs.existsSync( __dirname + '/../maps/' + this.mapID + '.map' ) )
			{
				console.log( 'Map ' + this.mapID + ' does not exist' );
				return false;
			}
			this.maxPlayers = config.maxPlayers.readInt8( 0 );
			this.status = Status.waitingForPlayers;
			return true;
		}
		else
		{
			console.log( 'Only admin can set config' );
			return false;
		}
	}

	joinGame( password, client )
	{
		if( this.status === Status.waitingForPlayers )
		{
			if( password.compare( this.password ) === 0 )
			{
				this.clients.push( client );
				if( this.clients.length === this.maxPlayers )
				{
					this.status = Status.waitingForConfirming;
					this.checkIfAllConfirmed();
				}
				return true;
			}
			console.log( 'Wrong password' );
			return false;
		}
		console.log( 'Room is not accessible anymore' );
		return false;
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

	checkIfAllConfirmed()
	{
		for( let i = 0 ; i < this.clients.length ; i++ )
		{
			if( this.clients[ i ].confirmedGame === false )
			{
				setTimeout( this.checkIfAllConfirmed.bind( this ), 1000 );
				return;
			}
		}
		this.status = Status.inGame;
		this.preparePlayersList();
		for( let i = 0 ; i < this.clients.length ; i++ )
		{
			this.clients[ i ].response.send( { opcode : 0x14 } );
		}
	}

	preparePlayersList()
	{
		let count = Buffer.alloc( 4 );
		count.writeInt32BE( this.clients.length, 0 );
		let clients = [];
		for( let i = 0 ; i < this.clients.length ; i++ )
		{
			let id = Buffer.alloc( 1 );
			id.writeInt8( i, 0 );
			clients.push( {
				id : id,
				name : this.clients[ i ].name
			} );
		}
		this.playersList = {
			players_count : count,
			players : clients
		};
	}

	getPlayers()
	{
		return this.playersList;
	}

	getWorms()
	{
		return this.wormsList;
	}
}

module.exports = Room;
