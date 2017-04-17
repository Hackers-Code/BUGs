'use strict';
const fs = require( 'fs' );
const MapFormat = require( './MapFormat' );
const Collection = require( '../../Collections' ).NumericIdCollection;
class MapsAPI extends Collection {
	constructor( array, resourcesPath )
	{
		super( 'maps', 'id' );
		this.maps = array;
		this.resourcesPath = resourcesPath;
	}

	loadMap( id, callback )
	{
		if( typeof callback !== 'function' )
		{
			throw new TypeError( 'Callback must be a function' );
		}
		let index = this.find( id );
		if( index === -1 )
		{
			callback( new Error( `Map with id ${id} does not exist` ) );
			return;
		}
		let mapPath = this.resourcesPath + this.maps[ index ][ "map_file" ];
		fs.readFile( mapPath, ( loadMapError, data ) =>
		{
			if( loadMapError )
			{
				callback( loadMapError );
			}
			else
			{
				try
				{
					let parsedMap = this.parse( data );
					callback( void 0, parsedMap );
				}
				catch( parseMapError )
				{
					callback( parseMapError );
				}
			}
		} );
	}

	mapExists( id )
	{
		return this.find( id ) !== -1;
	}

	parse( map )
	{
		let mapStruct = {};
		let offset = 0;
		while( offset < map.length )
		{
			let opcode = map[ offset++ ];
			let object = {};
			let sectionData = MapFormat[ opcode ];
			if( typeof sectionData !== 'object' )
			{
				throw new Error( 'Map file broken' );
			}
			let sectionName = sectionData.name;
			if( typeof mapStruct[ sectionName ] === 'undefined' )
			{
				mapStruct[ sectionData.name ] = [];
			}
			sectionData.values.forEach( ( element ) =>
			{
				if( offset + element.length > map.length )
				{
					throw new Error( 'Unexpected end of file' );
				}
				let chunk = map.slice( offset, offset += element.length );
				let result = chunk;
				if( chunk.length === 1 )
				{
					result = chunk.readUInt8( 0 );
				}
				else if( chunk.length === 2 )
				{
					result = chunk.readUInt16BE( 0 );
				}
				else if( chunk.length === 4 )
				{
					result = chunk.readUInt32BE( 0 );
				}
				object[ element.name ] = result;
			} );
			mapStruct[ sectionName ].push( object );
		}
		return mapStruct;
	}
}
module.exports = MapsAPI;
