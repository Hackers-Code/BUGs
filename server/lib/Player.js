class Player {
	constructor( socket )
	{
		this.id = null;
		this.name = null;
		this.socket = socket;
	}

	setId( id )
	{
		this.id = Buffer.from( id )
	}

	setName( name )
	{
		this.name = Buffer.from( name );
	}
}

module.exports = Player;