'use strict';
const Parser = require( './Parser' );
const MapFormat = require( './MapFormat' );
const fs = require( 'fs' );
class MapParser {
	constructor()
	{
		this.parser = new Parser( 'opcode:1' );
		this.map = null;
		this.metadata = {};
		this.uniqueSpawns = [];
		this.spawns = [];
		this.blocks = [];
		this.killingZones = [];
	}

	loadMap( number )
	{
		this.map = fs.readFileSync( __dirname + '/../maps/' + number + '.map' );
		this.parse();
	}

	parse()
	{
		if( this.map === null )
		{
			return false;
		}
		let offset = 0;
		for( let i = 0 ; i < MapFormat.metadata.length ; i++ )
		{
			this.metadata[ MapFormat.metadata[ i ].name ] = this.map.slice( offset,
				offset += MapFormat.metadata[ i ].length );
		}
		while( offset < this.map.length )
		{
			let blockInfo = MapFormat.data[ MapParser.findObject( this.map.readInt8( offset ) ) ];
			let object = this.parser.decode( blockInfo.rule, this.map.slice( offset, offset += blockInfo.length ) );
			if( blockInfo.name === 'spawn' )
			{
				object.x = object.x.readInt32BE( 0 );
				object.y = object.y.readInt32BE( 0 );
				this.spawns.push( object );
			}
			else if( blockInfo.name === 'block' )
			{
				object.x = object.x.readInt32BE( 0 );
				object.y = object.y.readInt32BE( 0 );
				object.width = object.width.readInt32BE( 0 );
				object.height = object.height.readInt32BE( 0 );
				this.blocks.push( object );
			}
			else if( blockInfo.name === 'killing_zone' )
			{
				object.x = object.x.readInt32BE( 0 );
				object.y = object.y.readInt32BE( 0 );
				object.width = object.width.readInt32BE( 0 );
				object.height = object.height.readInt32BE( 0 );
				this.killingZones.push( object );
			}
		}
		this.uniqueSpawns = this.spawns;
	}

	static findObject( opcode )
	{
		for( let i = 0 ; i < MapFormat.data.length ; i++ )
		{
			if( MapFormat.data[ i ].opcode === opcode )
			{
				return i;
			}
		}
		return -1;
	}

	getUniqueSpawn()
	{
		let index = Math.floor( Math.random() * this.uniqueSpawns.length );
		let retval = this.uniqueSpawns[ index ];
		this.uniqueSpawns.splice( index, 1 );
		return retval;
	}
}

module.exports = MapParser;
