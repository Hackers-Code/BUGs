'use strict';
const UniqueKeyGenerator = require( '../../Helpers/UniqueKeyGenerator' );
const UniqueNameStorage = require( '../../Helpers/UniqueNameStorage' );
const SearchEngine = require( '../../Helpers/SearchEngine' );
const Room = require( './Room' );
class RoomsStorage {
	constructor()
	{
		this.rooms = [];
		this.uniqueKeyGenerator = new UniqueKeyGenerator( 4 );
		this.uniqueNameStorage = new UniqueNameStorage( 20, '' );
	}

	addRoom( settings, admin )
	{
		if( typeof settings === 'undefined' || typeof settings.name === 'undefined' || Buffer.isBuffer(
				settings.name ) === false || typeof settings.password !== 'string' )
		{
			return false;
		}
		if( this.uniqueNameStorage.addName( settings.name ) )
		{
			let id = this.uniqueKeyGenerator.generateKey();
			let room = new Room( settings, admin, id, this );
			let length = this.rooms.push( room );
			return this.rooms[ length - 1 ];
		}
		return false;
	}

	listAvailableGames()
	{
		let games = [];
		for( let i = 0 ; i < this.rooms.length ; i++ )
		{
			let roomInfo = this.rooms[ i ].isAvailable();
			if( roomInfo !== false )
			{
				games.push( {
					id : roomInfo.id,
					name : roomInfo.name
				} );
			}
		}
		return games;
	}

	removeRoom( id )
	{
		let room = SearchEngine.findByUniqueID( id, this.rooms );
		if( room !== false && room !== -1 )
		{
			let game = this.rooms[ room ].getGame();
			game.stop();
			this.rooms[ room ].tasks.forEach( ( element ) =>
			{
				this.tasksStorage.removeTask( element );
			} );
			this.uniqueKeyGenerator.freeKey( this.rooms[ room ].id );
			this.uniqueNameStorage.removeName( this.rooms[ room ].name );
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
			let room = SearchEngine.findByUniqueID( params.room, this.rooms );
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
