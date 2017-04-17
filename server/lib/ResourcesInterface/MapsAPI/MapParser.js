'use strict';
const MapFormat = require( './MapFormat' );
const MapParser = {
	parse : function( map )
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
				object[ element.name ] = map.slice( offset, offset += element.length );
			} );
			mapStruct[ sectionName ].push( object );
		}
		return mapStruct;
	}
};
module.exports = MapParser;
