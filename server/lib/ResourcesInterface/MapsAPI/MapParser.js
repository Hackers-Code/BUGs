'use strict';
const MapFormat = require( './MapFormat' );
const MapParser = {
	parse : function( map )
	{
		let mapStruct = { metadata : {} };
		let offset = 0;
		MapFormat.meta.values.forEach( ( element ) =>
		{
			if( offset + element.length > map.length )
			{
				throw new Error( 'Map file invalid' );
			}
			mapStruct.metadata[ element.name ] = map.slice( offset, offset += element.length );
		} );
		while( offset < map.length )
		{
			let opcode = map[ offset++ ];
			let object = {};
			if( typeof MapFormat[ opcode ] === 'undefined' )
			{
				throw new Error( 'Map file broken' );
			}
			if( typeof mapStruct[ MapFormat[ opcode ].name ] === 'undefined' )
			{
				mapStruct[ MapFormat[ opcode ].name ] = [];
			}
			MapFormat[ opcode ].values.forEach( ( element ) =>
			{
				if( offset + element.length > map.length )
				{
					throw new Error( 'Unexpected end of file' );
				}
				object[ element.name ] = map.slice( offset, offset += element.length );
			} );
			mapStruct[ MapFormat[ opcode ].name ].push( object );
		}
		return mapStruct;
	}
};

module.exports = MapParser;
