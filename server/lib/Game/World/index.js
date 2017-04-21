'use strict';
const SAT = require( 'sat' );
const Block = require( './Objects/Block' );
const KillingZone = require( './Objects/KillingZone' );
class World {
	constructor( parsedMap )
	{
		this.parsedMap = parsedMap;
		this.spawns = parsedMap.spawns || [];
		this.bounds = new SAT.Box( new SAT.Vector( 0, 0 ), parsedMap.metadata[ 0 ].width,
			parsedMap.metadata[ 0 ].height ).toPolygon();
		this.addObjects( 'blocks', Block );
		this.addObjects( 'killingZones', KillingZone );
	}

	addObjects( property, _class )
	{
		if( typeof this.parsedMap[ property ] !== 'undefined' )
		{
			this[ property ] = [];
			this.parsedMap[ property ].forEach( ( element ) =>
			{
				this[ property ].push( new _class( element ) );
			} );
		}
	}

	popRandomSpawn()
	{
		if( this.spawns.length === 0 )
		{
			throw new Error( 'There is no spawn on map' );
		}
		let randomIndex = Math.floor( Math.random() * this.spawns.length );
		let retval = this.spawns[ randomIndex ];
		this.spawns.splice( randomIndex, 1 );
		return retval;
	}
}
module.exports = World;
