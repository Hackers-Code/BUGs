class Player {
	constructor( client, playersStorage )
	{
		this.playersStorage = playersStorage;
		this.uniqueNameStorage = playersStorage.getUniqueNameStorage();
		this.name = this.uniqueNameStorage.getDefault();
		this.client = client;
		this.hasCustomName = false;
		this.isInLobby = false;
		this.isInGame = false;
		this.handleEvents();
	}

	handleEvents()
	{
		this.client.on( 'disconnect', () =>
		{
			this.playersStorage.remove();
			console.log( 'disconnected' );
		} );
		client.on( 'error', ( error ) =>
		{
			console.log( error.message );
		} );
		client.on( 'changeName', ( data, respond ) =>
		{
			console.log( data.name );
			respond( { status : true } );
		} );
	}

	setName( data )
	{
		if( this.uniqueNameStorage.addName( data.name ) )
		{
			if( this.hasCustomName === true )
			{
				if( !this.uniqueNameStorage.removeName( this.name ) )
				{
					return false;
				}
			}
			this.name = data.name;
			this.hasCustomName = true;
			return true;
		}
		return false;
	}

}
module.exports = Player;
