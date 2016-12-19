class Object {
	constructor( data )
	{
		this.x = typeof data.x !== 'undefined' ?
		         data.x.readInt32BE( 0 ) :
		         0;
		this.y = typeof data.y !== 'undefined' ?
		         data.y.readInt32BE( 0 ) :
		         0;
		this.width = typeof data.width !== 'undefined' ?
		             data.width.readInt32BE( 0 ) :
		             0;
		this.height = typeof data.height !== 'undefined' ?
		              data.height.readInt32BE( 0 ) :
		              0;
	}
}
module.exports = Object;
