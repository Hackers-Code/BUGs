class Player {
	constructor( socket )
	{
		this.id = null;
		this.name = null;
		this.socket = socket;
		this.roomID = null;
	}

	addToGame( id )
	{
		this.roomID = Buffer.from( id );
	}

	getGame()
	{
		return this.roomID;
	}

	setId( id )
	{
		this.id = Buffer.from( id );
	}

	setName( name )
	{
		this.name = Buffer.from( name );
	}

	isFree()
	{
		return this.roomID === null;
	}
}

module.exports = Player;