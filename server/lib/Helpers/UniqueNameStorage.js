'use strict';
class UniqueNameStorage {
	constructor( length, defaultName )
	{
		this.nameLength = length;
		this.storedNames = [];
		this.defaultName = Buffer.alloc( this.nameLength );
		this.defaultName.write( defaultName, 0 );
	}

	getDefault()
	{
		return this.defaultName;
	}

	addName( name )
	{
		if( !name instanceof Buffer )
		{
			return false;
		}
		if( name.length !== this.nameLength )
		{
			return false;
		}
		if( !this.isUnique( name ) )
		{
			return false;
		}
		this.storedNames.push( name );
		return true;
	}

	removeName( name )
	{
		for( let i = 0 ; i < this.storedNames.length ; i++ )
		{
			if( Buffer.compare( name, this.storedNames[ i ] ) === 0 )
			{
				this.storedNames.splice( i, 1 );
				return true;
			}
		}
		return false;
	}

	isUnique( name )
	{
		if( Buffer.compare( name, this.defaultName ) === 0 )
		{
			return false;
		}
		for( let i = 0 ; i < this.storedNames.length ; i++ )
		{
			if( Buffer.compare( name, this.storedNames[ i ] ) === 0 )
			{
				return false;
			}
		}
		return true;
	}
}
module.exports = UniqueNameStorage;
