'use strict';
const SAT = require( 'sat' );
const Spawn = require( './Objects/Spawn' );
const Block = require( './Objects/Block' );
const KillingZone = require( './Objects/KillingZone' );
class World {
	constructor( parsedMap )
	{
		this.bounds = new SAT.Box( new SAT.Vector( 0, 0 ), parsedMap.metadata[ 0 ].width,
			parsedMap.metadata[ 0 ].height ).toPolygon();
		this.spawns = [];
		this.blocks = [];
		this.killingZones = [];
		if( typeof parsedMap.spawns !== 'undefined' )
		{
			parsedMap.spawns.forEach( ( element ) =>
			{
				this.spawns.push( new Spawn( element ) );
			} );
		}
		if( typeof parsedMap.blocks !== 'undefined' )
		{
			parsedMap.blocks.forEach( ( element ) =>
			{
				this.spawns.push( new Block( element ) );
			} );
		}
		if( typeof parsedMap.killingZones !== 'undefined' )
		{
			parsedMap.killingZones.forEach( ( element ) =>
			{
				this.spawns.push( new KillingZone( element ) );
			} );
		}
	}
}
module.exports = World;
