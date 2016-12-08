class UniqueNameStorage {
	constructor( length )
	{
		this.nameLength = length;
		this.storedNames = [];
	}

	checkName( name )
	{
		if( !name instanceof Buffer )
		{
			console.log( 'Name must be a buffer' );
			return false;
		}
		if( name.length !== this.nameLength )
		{
			console.log( 'Name is not correct size' );
			return false;
		}
		for( let i = 0 ; i < this.storedNames.length ; i++ )
		{
			if( this.storedNames[ i ].compare( name ) === 0 )
			{
				return false;
			}
		}
		this.storedNames.push( name );
		return true;
	}
}

module.exports = UniqueNameStorage;