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

	checkCollisionLeft( y, x )
	{
		if( x < 0 )
		{
			return 0;
		}
		for( let i = 0 ; i < this.blocks.length ; i++ )
		{
			let block = this.blocks[ i ];
			if( (y >= block.y) && (y <= block.y + block.height) && ( x <= block.x ) && ( x >= block.x + block.width) )
			{
				return block.x + block.width;
			}
		}
		return false;
	}

	checkCollisionRight( y, x, width )
	{//(((block.y>=y)&&(block.y<=y+worm.height))||((block.y<y)&&(block.y+block.width>y)))
		if( x + width > this.width )
		{
			return this.width;
		}
		for( let i = 0 ; i < this.blocks.length ; i++ )
		{
			let block = this.blocks[ i ];
			if( (y >= block.y) && (y <= block.y + block.height) && (x + width >= block.x ) && ( x + width <= block.x + block.width) )
			{
				return block.x;
			}
		}
		return false;
	}

	checkCollisionTop( y, x )
	{
		if( y < 0 )
		{
			return 0;
		}
		for( let i = 0 ; i < this.blocks.length ; i++ )
		{
			let block = this.blocks[ i ];
			if( (y >= block.y) && (y <= block.y + block.height) && ( x >= block.x ) && ( x <= block.x + block.width) )
			{
				return block.y + block.height;
			}
		}
		return false;
	}

	checkCollisionBottom( y, height, x )
	{
		if( y + height > this.height )
		{
			return this.height;
		}
		for( let i = 0 ; i < this.blocks.length ; i++ )
		{
			let block = this.blocks[ i ];
			if( (y + height <= block.y + block.height) && (y + height >= block.y) && ( x >= block.x ) && ( x <= block.x + block.width) )
			{
				return block.y;
			}
		}
		return false;
	}
}

module.exports = World;
