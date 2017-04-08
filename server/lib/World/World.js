const Spawn = require( './Objects/Spawn' );
const Block = require( './Objects/Block' );
const KillingZone = require( './Objects/KillingZone' );
class World {
	constructor( parsedMap )
	{
		let width = parsedMap.metadata.width.readUInt32BE( 0 );
		let height = parsedMap.metadata.height.readUInt32BE( 0 );
		let corner = new SAT.Vector( 0, 0 );
		let box = new SAT.Box( corner, width, height );
		this.hitbox = box.toPolygon();
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
				this.blocks.push( new Block( element ) );
			} );
		}
		if( typeof parsedMap.killingZones !== 'undefined' )
		{
			parsedMap.killingZones.forEach( ( element ) =>
			{
				this.killingZones.push( new KillingZone( element ) );
			} );
		}
	}

	getHitbox()
	{
		return this.hitbox;
	}

	getUniqueSpawn()
	{
		let index = Math.floor( Math.random() * this.spawns.length );
		let spawn = this.spawns[ index ];
		this.spawns.splice( index, 1 );
		return spawn;
	}
}

module.exports = World;
