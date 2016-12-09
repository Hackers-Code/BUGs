class Player {
	constructor( socket )
	{
		this.id = null;
		this.name = null;
		this.socket = socket;
		this.roomID = null;
		this.confirmedGame = false;
	}

	addToGame( id )
	{
		this.roomID = Buffer.from( id );
	}

	changeSocket( socket )
	{
		this.socket = socket;
	}

	getSocket()
	{
		return this.socket;
	}

	confirmGame()
	{
		if( this.confirmedGame !== true && this.roomID !== null )
		{
			this.confirmedGame = true;
			return true;
		}
		else
		{
			console.log( 'Player already accepted game!' );
			return false;
		}
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