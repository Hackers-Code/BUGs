const fs = require( 'fs' );
class Weapons {
	constructor()
	{
		this.weaponsList = [];
	}

	loadWeaponsListFromFile( callback )
	{
		fs.readFile( process.cwd() + '/resources/weapons/list.json', ( err, data ) =>
		{
			if( err )
			{
				callback( err );
			}
			try
			{
				this.weaponsList = JSON.parse( data );
			}
			catch( err )
			{
				callback( err );
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
