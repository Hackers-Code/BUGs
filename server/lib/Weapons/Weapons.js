const fs = require( 'fs' );
class Weapons {
	constructor()
	{
		this.weaponsList = [];
	}

	loadWeaponsListFromFile( path, callback )
	{
		fs.readFile( path, ( err, data ) =>
		{
			if( err )
			{
				throw err;
			}
			try
			{
				this.weaponsList = JSON.parse( data );
			}
			catch( e )
			{
				throw e;
			}
			callback();
		} );
	}

	getWeaponsList()
	{
		return this.weaponsList.slice();
	}
}

module.exports = Weapons;
