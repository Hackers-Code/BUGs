'use strict';
const Request = require( './Request' );
const Response = require( './Response' );
class Client {
	constructor( socket, clientsStorage )
	{
		this.socket = socket;
		this.clientsStorage = clientsStorage;
		this.request = new Request( this, socket );
		this.response = new Response( socket );
		this.id = null;
		this.name = Buffer.alloc( 20 );
		this.hasCustomName = false;
		this.room = null;
		this.confirmedGame = false;
		this.socket.on( 'data', this.request.handleRequest.bind( this.request ) );
		this.socket.on( 'error', function()
		{
			console.log( 'error' );
		} );
		this.socket.on( 'close', this.handleSocketClose.bind( this ) );
	}

	handleSocketClose()
	{
		console.log( 'Disconnected ' + this.socket.remoteAddress + ', socket id: ' + this.socket.id );
	}

	disconnect()
	{
		this.clientsStorage.removeName( this.name );
		this.clientsStorage.removeClient( this.socket.id );
		this.socket.end();
	}

	setID()
	{
		this.id = this.clientsStorage.generateId();
		this.response.send( {
			opcode : 0x2,
			id : this.id
		} );
	}

	getID()
	{
		return this.id;
	}

	setName( data )
	{
		let status = 0;
		if( this.clientsStorage.addName( data.nick ) )
		{
			if( this.hasCustomName === true )
			{
				!this.clientsStorage.removeName( this.name );
			}
			this.name = data.nick;
			this.hasCustomName = true;
			status = 1;
		}
		this.response.send( {
			opcode : 0x4,
			status : Buffer.from( [ status ] )
		} );
	}

	listGames()
	{
		let retval = this.clientsStorage.listAvailableGames();
		retval.opcode = 0x6;
		this.response.send( retval );
	}

	createRoom( data )
	{
		let status = 0;
		if( this.room === null )
		{
			let room = this.clientsStorage.addRoom( {
				name : data.roomName,
				password : data.password
			}, this );
			if( room !== false )
			{
				this.room = room;
				status = 1;
			}
		}
		else
		{
			console.log( 'You are already in room!' );
		}
		this.response.send( {
			opcode : 0x8,
			status : Buffer.from( [ status ] )
		} );
	}

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
			console.log( 'You need to create a room first!' );
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
			console.log( 'You are in a room already!' );
		}
		retval.status = Buffer.from( [ retval.status ] );
		this.response.send( retval );
	}

	confirmGame()
	{
		let status = 0;
		if( this.room !== null )
		{
			this.confirmedGame = true;
			status = 1;
		}
		else
		{
			console.log( 'You need to join game first!' );
		}
		this.response.send( {
			opcode : 0x13,
			status : Buffer.from( [ status ] )
		} );
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
			console.log( 'You need to join game first!' );
		}
	}

	getWorms()
	{
		if( this.room !== null )
		{
			let retval = this.room.getWorms();
			retval.opcode = 0x18;
			this.response.send( retval );
		}
		else
		{
			console.log( 'You need to join game first!' );
		}
	}
}

module.exports = Client;
