const Parser = require( './Parser.js' );
const fs = require( 'fs' );
class Map {
	constructor()
	{
		this.metadataRules = [
			{
				name : 'width',
				length : 4
			},
			{
				name : 'height',
				length : 4
			}
		];
		this.objectsRules = [
			{
				name : 'spawn',
				length : 9,
				opcode : 0x1,
				rule : 'x:4;y:4'
			},
			{
				name : 'block',
				length : 17,
				opcode : 0x2,
				rule : 'x:4;y:4;width:4;height:4'
			}
		];
		this.parser = new Parser( 'opcode:1' );
		this.map = null;
		this.uniqueSpawns = [];
		this.blocks = [];
		this.metadata = [];
	}

	collideY( y )
	{
		for( let i = 0 ; i < this.blocks.length ; i++ )
		{
			if( y >= this.blocks[ i ].y.readInt32BE( 0 ) && y <= this.blocks[ i ].y.readInt32BE(
					0 ) + this.blocks[ i ].height.readInt32BE( 0 ) )
			{
				return true;
			}
		}
		return false;
	}

	loadMap( fileName )
	{
		this.map = fs.readFileSync( __dirname + fileName );
		this.parse();
	}

	parse()
	{
		if( this.map === null )
		{
			return false;
		}
		let offset = 0;
		for( let i = 0 ; i < this.metadataRules.length ; i++ )
		{
			this.metadata.push( this.map.slice( offset, offset += this.metadataRules[ i ].length ) );
		}
		while( offset < this.map.length )
		{
			let object = this.objectsRules[ this.findObject( this.map.readInt8( offset ) ) ];
			let entity = this.parser.decode( object.rule, this.map.slice( offset, offset += object.length ) );
			if( object.name === 'spawn' )
			{
				this.uniqueSpawns.push( entity );
			}
			if( object.name === 'block' )
			{
				this.blocks.push( entity );
			}
		}
	}

	getUniqueSpawn()
	{
		let index = Math.floor( Math.random() * this.uniqueSpawns.length );
		let retval = this.uniqueSpawns[ index ];
		this.uniqueSpawns.splice( index, 1 );
		return retval;
	}

	findObject( opcode )
	{
		for( let i = 0 ; i < this.objectsRules.length ; i++ )
		{
			if( this.objectsRules[ i ].opcode === opcode )
			{
				return i;
			}
		}
		return -1;
	}
}

module.exports = Map;