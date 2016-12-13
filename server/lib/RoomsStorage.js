'use strict';
const UniqueKeyGenerator = require( './UniqueKeyGenerator' );
const UniqueNameStorage = require( './UniqueNameStorage' );
const Room = require( './Room' );
class RoomsStorage {
	constructor()
	{
		this.availableGamesResponse = null;
		this.rooms = [];
		this.uniqueKeyGenerator = new UniqueKeyGenerator( 4 );
		this.uniqueNameStorage = new UniqueNameStorage( 20 );
		this.getAvailableGames();
	}

	addRoom( settings, client )
	{
		if( typeof settings.name !== 'undefined' || typeof settings.password !== 'undefined' )
		{
			if( this.uniqueNameStorage.addName( settings.name ) )
			{
				let id = this.uniqueKeyGenerator.generateKey();
				let room = new Room( settings, client, id );
				let length = this.rooms.push( room );
				return this.rooms[ length - 1 ];
			}
			return false;
		}
		console.log( 'Room name or password not specified' );
		return false;
	}

	removeRoom( id )
	{
		let room = this.findRoomById( id );
		if( room !== false && room !== -1 )
		{
			this.rooms.splice( room, 1 );
		}
		else
		{
			console.log( 'Room not found' );
			return false;
		}
	}

	getAvailableGames()
	{
		let gamesCount = 0;
		let count = Buffer.alloc( 4 );
		let games = [];
		for( let i = 0 ; i < this.rooms.length ; i++ )
		{
			let roomInfo = this.rooms[ i ].isAvailable();
			if( roomInfo !== false )
			{
				gamesCount++;
				games.push( {
					id : roomInfo.id,
					name : roomInfo.name
				} );
			}
		}
		count.writeInt32BE( gamesCount, 0 );
		this.availableGamesResponse = {
			count : count,
			games : games
		};
		setTimeout( this.getAvailableGames.bind( this ), 5000 );
	}

	listAvailableGames()
	{
		return this.availableGamesResponse;
	}

	joinGame( params, client )
	{
		if( typeof params.roomID !== 'undefined' && typeof params.password !== 'undefined' )
		{
			let room = this.findRoomById( params.roomID );
			if( room !== false && room !== -1 )
			{
				if( this.rooms[ room ].joinGame( params.password, client ) )
				{
					return this.rooms[ room ];
				}
				console.log( 'Could not join game' );
				return false;
			}
			else
			{
				console.log( 'Room not found' );
				return false;
			}
		}
		console.log( 'Room id or password not specified' );
		return false;
	}

	findRoomById( id )
	{
		if( !id instanceof Buffer )
		{
			console.log( 'ID must be a buffer!' );
			return false;
		}
		console.log( 'Looking for room with id: ' + id.toString( 'hex' ) );
		for( let i = 0 ; i < this.rooms.length ; i++ )
		{
			if( this.rooms[ i ].id.compare( id ) === 0 )
			{
				return i;
			}
		}
		return -1;
	}

}

module.exports = RoomsStorage;
