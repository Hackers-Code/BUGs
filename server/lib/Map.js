const Parser = require( './Parser.js' );
const fs = require( 'fs' );
class Map {
	constructor()
	{
		this.metadata = [
			{
				name : 'width',
				length : 4
			},
			{
				name : 'height',
				length : 4
			}
		];
		this.objects = [
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
	}

	loadMap( fileName )
	{
		this.map = fs.readFileSync( fileName );
		this.parse();
	}

	parse()
	{
		if( this.map === null )
		{
			return false;
		}
		let offset = 0;
		for( let i = 0 ; i < this.metadata.length ; i++ )
		{
			console.log( this.metadata[ i ].name );
			console.log( this.map.slice( offset, offset += this.metadata[ i ].length ) );
		}
		while( offset < this.map.length )
		{
			let object = this.objects[ this.findObject( this.map.readInt8( offset ) ) ];
			let entity = this.parser.decode( object.rule, this.map.slice( offset, offset += object.length ) );
			if( object.name === 'spawn' )
			{
				this.uniqueSpawns.push( entity );
			}
			console.log( object );
			console.log( entity );
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
		for( let i = 0 ; i < this.objects.length ; i++ )
		{
			if( this.objects[ i ].opcode === opcode )
			{
				return i;
			}
		}
		return -1;
	}
}

module.exports = Map;