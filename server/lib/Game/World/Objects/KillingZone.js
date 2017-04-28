'use strict';
const Object = require( './Object' );
class KillingZone extends Object {
	constructor( element )
	{
		super( element, {
			affectedByGravity : false,
			destroyable : false
		} );
	}
}
module.exports = KillingZone;
