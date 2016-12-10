class Worm {
	constructor( ownerID, id, coords )
	{
		this.hp = Buffer.from( [ 100 ] );
		this.ownerID = Buffer.from( ownerID );
		this.id = Buffer.from( [ id ] );
		this.x = coords.x;
		this.y = coords.y;
	}
}

module.exports = Worm;