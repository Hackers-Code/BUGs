class Worm {
	constructor( ownerID, id, coords )
	{
		this.hp = Buffer.from( [ 200 ] );
		this.ownerID = Buffer.from( [ ownerID ] );
		this.id = Buffer.from( [ id ] );
		this.x = Buffer.alloc( 8 );
		this.x.writeDoubleBE( coords.x.readInt32BE( 0 ), 0 );
		this.y = Buffer.alloc( 8 );
		this.y.writeDoubleBE( coords.y.readInt32BE( 0 ), 0 );
		this.width = 100;
		this.height = 120;
		this.speedY = 0;
	}
}

module.exports = Worm;