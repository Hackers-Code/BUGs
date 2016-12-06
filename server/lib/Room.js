class Room {
	constructor( id, name, ownerID )
	{
		this.id = Buffer.from( id );
		this.name = Buffer.from( name );
		this.ownerID = ownerID;
	}
}

module.exports = Room;