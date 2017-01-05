const Spawn = require( './Objects/Spawn' );
const Block = require( './Objects/Block' );
const KillingZone = require( './Objects/KillingZone' );
class World {
	constructor( parsedMap )
	{
		this.width = parsedMap.metadata.width.readInt32BE( 0 );
		this.height = parsedMap.metadata.height.readInt32BE( 0 );
		this.spawns = [];
		this.blocks = [];
		this.killingZones = [];
		if( typeof parsedMap.spawns !== 'undefined' )
		{
			parsedMap.spawns.forEach( ( element ) =>
			{
				let spawn = new Spawn( element );
				this.spawns.push( spawn );
			} );
		}
		this.unusedSpawns = this.spawns;
		if( typeof parsedMap.blocks !== 'undefined' )
		{
			parsedMap.blocks.forEach( ( element ) =>
			{
				let block = new Block( element );
				this.blocks.push( block );
			} );
		}
		if( typeof parsedMap.killingZones !== 'undefined' )
		{
			parsedMap.killingZones.forEach( ( element ) =>
			{
				let killingZone = new KillingZone( element );
				this.killingZones.push( killingZone );
			} );
		}
	}

	getUniqueSpawn()
	{
		let index = Math.floor( Math.random() * this.unusedSpawns.length );
		let spawn = this.unusedSpawns[ index ];
		this.unusedSpawns.splice( index, 1 );
		return spawn;
	}
}

module.exports = World;
