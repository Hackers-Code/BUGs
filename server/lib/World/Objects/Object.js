const SAT = require( 'sat' );
class Object {
	constructor( data )
	{
		let x = typeof data.x !== 'undefined' ? data.x.readInt32BE( 0 ) : 0;
		let y = typeof data.y !== 'undefined' ? data.y.readInt32BE( 0 ) : 0;
		let width = typeof data.width !== 'undefined' ? data.width.readInt32BE( 0 ) : 0;
		let height = typeof data.height !== 'undefined' ? data.height.readInt32BE( 0 ) : 0;
		let corner = new SAT.Vector( x, y );
		let box = new SAT.Box( corner, width, height );
		this.hitbox = box.toPolygon();
	}
}
module.exports = Object;
