'use strict';
class Weapons {
	getWeaponsList()
	{
		let weaponsList = [];
		for( let i = 0 ; i < this._weaponsList.length ; i++ )
		{
			weaponsList.push( {
				id : this._weaponsList[ i ].id,
				usages : this._weaponsList[ i ].usages,
				dmg : this._weaponsList[ i ].dmg || 0,
				radius : this._weaponsList[ i ].radius || 0,
				notEndRound : this._weaponsList[ i ].notEndRound || false,
				explosive : this._weaponsList[ i ].explosive || false,
				delay : this._weaponsList[ i ].delay || 0,
				bounces : this._weaponsList[ i ].bounces || false
			} );
		}
		return weaponsList;
	}

	constructor( array )
	{
		this._weaponsList = array;
	}
}
module.exports = Weapons;
