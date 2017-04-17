'use strict';
const Collection = require( '../../Collections' ).UniqueKeyCollection;
const UniqueKeyGenerator = require( '../../Helpers/UniqueKeyGenerator' );
const UniqueNameStorage = require( '../../Helpers/UniqueNameStorage' );
const Room = require( './Room' );
class RoomsCollection extends Collection {
	constructor( mapAPI )
	{
		super( 'rooms', 'id' );
		this.rooms = [];
		this.mapAPI = mapAPI;
		this.uniqueKeyGenerator = new UniqueKeyGenerator( 4 );
		this.uniqueNameStorage = new UniqueNameStorage( 20, '' );
	}

	getMapAPI()
	{
		return this.mapAPI;
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
			this.rooms.push( room );
			return true;
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
		let room = this.find( id );
		if( room !== -1 )
		{
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
			let room = this.find( params.room );
			if( room !== -1 )
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

module.exports = RoomsCollection;
