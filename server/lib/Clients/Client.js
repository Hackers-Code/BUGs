'use strict';
const ClientStatus = {
	connected : 0,
	named : 1,
	inLobby : 2,
	inGame : 3
};
const Request = require( '../Network/Request' );
const Response = require( '../Network/Response' );
class Client {
	constructor( socket, id, closeHandler )
	{
		this.socket = socket;
		this.id = id;
		this.status = ClientStatus.connected;
		this.name = Buffer.alloc( 20 );
		this.response = new Response( socket );
		this.request = new Request( this, this.response );
		this.udp = null;
		this.response.send( {
			opcode : 0x05,
			id : this.id
		} );
		this.room = null;
		this.player = null;
		this.socket.on( 'data', this.dataHandler );
		this.socket.on( 'error', ( err ) => {} );
		this.socket.on( 'close', closeHandler );
	}

	dataHandler( data )
	{
		this.request.handleRequest( data );
	}

	setName( data )
	{
		if( this.clientsStorage.addName( data.name ) )
		{
			if( this.status === ClientStatus.named )
			{
				if( !this.clientsStorage.removeName( this.name ) )
				{
					return false;
				}
			}
			this.name = data.name;
			this.status = ClientStatus.named;
			return true;
		}
		return false;
	}

	listGames()
	{
		return this.roomsStorage.listAvailableGames();
	}

	createRoom( data )
	{
		if( this.room === null )
		{
			let room = this.roomsStorage.addRoom( {
				name : data.name,
				password : data.password
			}, this );
			if( room !== false )
			{
				this.status = ClientStatus.inLobby;
				this.room = room;
				return true;
			}
		}
		return false;
	}

	leaveRoom()
	{
		if( this.status === ClientStatus.inLobby || this.status === ClientStatus === ClientStatus.inGame )
		{
			this.leaveLobby();
		}
	}

	leaveLobby()
	{
		if( this.room !== null )
		{
			this.room.leave( this.id );
			this.room = null;
			this.player = null;
			return true;
		}
		return false;
	}

	setRoomConfig( data )
	{
		if( this.room !== null )
		{
			if( this.room.setConfig( this.id, {
					mapID : data.map,
					maxPlayers : data.players
				} ) )
			{
				return true;
			}
		}
		return false;
	}

	joinRoom( data )
	{
		if( this.room === null )
		{
			let room = this.roomsStorage.joinRoom( data, this );
			if( room !== false )
			{
				this.room = room;
				this.status = ClientStatus.inLobby;
				return true;
			}
		}
		return false
	}

	setGamePhysics( data )
	{
		if( this.room !== null )
		{
			if( this.room.setPhysics( this.id, data ) )
			{
				return true;
			}
		}
		return false;
	}

	getRoomConfig()
	{
		return this.room.getRoomConfig();
	}

	setPlayerProperties( data )
	{
		if( this.player !== null )
		{
			return this.player.setProperties( data );
		}
		return false;
	}

	switchReady()
	{
		if( this.player !== null )
		{
			this.player.confirm();
			return true;
		}
		return false;
	}

	listPlayers()
	{
		if( this.room !== null )
		{
			return this.room.getPlayers();
		}
	}

	mapLoaded()
	{
		if( this.player !== null )
		{
			this.player.setMapLoaded();
			this.status = ClientStatus.inGame;
			return true;
		}
		return false;
	}

	setUDP( rinfo )
	{
		this.udp = rinfo;
	}

	jump()
	{
		if( this.room !== null && this.isYourMove === true )
		{
			this.room.jump();
		}
	}

	switchMoveLeft()
	{
		if( this.room !== null && this.isYourMove === true )
		{
			this.room.switchMoveLeft();
		}
	}

	switchMoveRight()
	{
		if( this.room !== null && this.isYourMove === true )
		{
			this.room.switchMoveRight();
		}
	}
}

module.exports.Client = Client;
module.exports.ClientStatus = ClientStatus;
