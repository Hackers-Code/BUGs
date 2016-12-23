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
		this.rooms = storage.roomsStorage;
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

	leaveLobby()
	{
		if( this.room !== null )
		{
			this.room.leave( this.id );
			return true;
		}
		return false;
	}

	joinGame( params, client )
	{
		return this.roomsStorage.joinGame( params, client );
	}

	/*TODO:Variables that might be useful
	 this.confirmedGame = false;
	 this.mapLoaded = false;
	 this.isYourMove = false;
	 */
	/*TODO: Methods to implement
	 setRoomSettings( data )
	 {
	 let status = 0;
	 if( this.room !== null )
	 {
	 if( this.room.setConfig( this.id, {
	 mapID : data.mapID,
	 maxPlayers : data.maxPlayers
	 } ) )
	 {
	 status = 1;
	 }
	 }
	 else
	 {

	 }
	 this.response.send( {
	 opcode : 0xA,
	 status : Buffer.from( [ status ] )
	 } );
	 }

	 joinGame( data )
	 {
	 let retval = {
	 opcode : 0x11,
	 status : 0
	 };
	 if( this.room === null )
	 {
	 let room = this.clientsStorage.joinGame( {
	 roomID : data.roomID,
	 password : data.password
	 }, this );
	 if( room !== false )
	 {
	 this.room = room;
	 retval.status = 1;
	 retval.mapID = Buffer.alloc( 4 );
	 retval.mapID.writeInt32BE( room.mapID, 0 );
	 }
	 }
	 else
	 {

	 }
	 retval.status = Buffer.from( [ retval.status ] );
	 this.response.send( retval );
	 }

	 confirmGame()
	 {
	 if( this.room !== null )
	 {
	 this.confirmedGame = !this.confirmedGame;
	 this.response.send( {
	 opcode : 0x13
	 } );
	 }
	 else
	 {

	 }
	 }

	 getPlayers()
	 {
	 if( this.room !== null )
	 {
	 let retval = this.room.getPlayers();
	 retval.opcode = 0x16;
	 this.response.send( retval );
	 }
	 else
	 {

	 }
	 }

	 getWorms()
	 {
	 if( this.room !== null )
	 {
	 if( this.mapLoaded === false )
	 {
	 this.mapLoaded = true;
	 }
	 let retval = this.room.getWorms();
	 retval.opcode = 0x18;
	 this.response.send( retval );
	 }
	 else
	 {

	 }
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
	 else
	 {

	 }
	 }

	 jump()
	 {
	 if( this.room !== null && this.isYourMove === true )
	 {
	 this.room.jump();
	 }
	 else
	 {

	 }
	 }

	 switchMoveLeft()
	 {
	 if( this.room !== null && this.isYourMove === true )
	 {
	 this.room.switchMoveLeft();
	 }
	 else
	 {

	 }
	 }

	 switchMoveRight()
	 {
	 if( this.room !== null && this.isYourMove === true )
	 {
	 this.room.switchMoveRight();
	 }
	 else
	 {
	 }
	 }
	 */
}

module.exports.Client = Client;
module.exports.ClientStatus = ClientStatus;
