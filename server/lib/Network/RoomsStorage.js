'use strict';
const UniqueKeyGenerator = require( './../Utils/UniqueKeyGenerator' );
const UniqueNameStorage = require( './../Utils/UniqueNameStorage' );
const SearchEngine = require( './../Utils/SearchEngine' );
const Room = require( './Room' );
class RoomsStorage {
	constructor( app )
	{
		this.app = app;
		this.availableGamesResponse = null;
		this.rooms = [];
		this.uniqueKeyGenerator = new UniqueKeyGenerator( 4 );
		this.uniqueNameStorage = new UniqueNameStorage( 20, '' );
		this.getAvailableGames();
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
			array : games
		};
		setTimeout( this.getAvailableGames.bind( this ), 5000 );
	}

	listAvailableGames()
	{
		return this.availableGamesResponse;
	}

	addRoom( settings, client )
	{
		if( typeof settings.name !== 'undefined' || typeof settings.password !== 'undefined' )
		{
			if( this.uniqueNameStorage.addName( settings.name ) )
			{
				let id = this.uniqueKeyGenerator.generateKey();
				let room = new Room( settings, client, id, this );
				let length = this.rooms.push( room );
				return this.rooms[ length - 1 ];
			}
			return false;
		}
		return false;
	}

	removeRoom( id )
	{
		let room = SearchEngine.findByUniqueID( this.rooms, id );
		if( room !== false && room !== -1 )
		{
			this.rooms[ room ].tasks.forEach( ( element ) =>
			{
				this.app.udp.removeTask( element );
			} );
			this.rooms.splice( room, 1 );
			return true;
		}
		else
		{
			return false;
		}
	}

	joinRoom( params, client )
	{
		if( typeof params.room !== 'undefined' && typeof params.password !== 'undefined' )
		{
			let room = SearchEngine.findByUniqueID( this.rooms, params.room );
			if( room !== false && room !== -1 )
			{
				if( this.rooms[ room ].joinRoom( params.password, client ) )
				{
					return this.rooms[ room ];
				}
				return false;
			}
			else
			{
				return false;
			}
		}
		return false;
	}
}

module.exports = RoomsStorage;
