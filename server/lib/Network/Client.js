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
		this.roomsStorage = storage.roomsStorage;
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
				this.room = room;
				return true;
			}
		}
		return false;
	}

	leaveRoom()
	{
		if( this.status === ClientStatus.inLobby )
		{
			this.leaveLobby();
		}
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

	setRoomConfig( data )
	{
		if( this.room !== null )
		{
			if( this.room.setConfig( this.id, {
					mapID : data.mapID,
					maxPlayers : data.maxPlayers
				} ) )
			{
				return true;
			}
		}
		return false;
	}

	joinGame( data )
	{
		if( this.room === null )
		{
			let room = this.roomsStorage.joinGame( data, this );
			if( room !== false )
			{
				this.room = room;
				return true;
			}
		}
		return false
	}

	switchReady()
	{
		if( this.room !== null )
		{
			this.room.confirm( this.id );
		}

	}

	listPlayers()
	{
		if( this.room !== null )
		{
			this.room.getPlayers();
		}
	}

	/*TODO: Methods to implement

	 getWorms()
	 {
	 if( this.room !== null )
	 {
	 if( this.mapLoaded === false )
	 {
	 this.mapLoaded = true;
	 }
	 let retval = this.room.getWorms();
	 }


	 getTimeLeft()
	 {
	 if( this.room !== null )
	 {
	 let seconds = Buffer.alloc( 1 );
	 seconds.writeUInt8( this.room.getTimeLeft(), 0 );
	 this.response.send( {
	 opcode : 0x1b,
	 seconds : seconds
	 } );
	 }
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
	 */
}

module.exports.Client = Client;
module.exports.ClientStatus = ClientStatus;
