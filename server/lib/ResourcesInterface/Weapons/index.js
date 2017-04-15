'use strict';
class Weapons {
	getWeaponsList()
	{
		return this._weaponsList.slice();
	}

	constructor( array )
	{
		this._weaponsList = array;
	}
}

module.exports = Weapons;
