'use strict';
const Object = require( './Object' );
class KillingZone extends Object {
	constructor( element )
	{
		super( element, {
			collidable : true
		} );
	}
}
module.exports = KillingZone;
