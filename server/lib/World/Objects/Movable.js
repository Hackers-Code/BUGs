const Object = require( './Object' );
class Movable extends Object {
	constructor( data )
	{
		super( data );
	}

	update()
	{
		throw new Error( 'You have to implement this method' );
	}
}
module.exports = Movable;
