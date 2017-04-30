'use strict';
const Object = require( './Object' );
class Block extends Object {
	constructor( element )
	{
		super( element, {
			affectedByGravity : false,
			destroyable : true,
			collidable : true
		} );
	}
}
module.exports = Block;
