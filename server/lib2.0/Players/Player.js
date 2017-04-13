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
			if( this.hasCustomName )
			{
				this.uniqueNameStorage.removeName( this.name );
			}
		} );
		this.client.on( 'error', ( error ) =>
		{
			throw error.message;
		} );
		this.client.on( 'changeName', this.setName.bind( this ) );
	}

	setName( data, respond )
	{
		if( this.uniqueNameStorage.addName( data.name ) )
		{
			if( this.hasCustomName === true )
			{
				if( !this.uniqueNameStorage.removeName( this.name ) )
				{
					return respond( { status : false } );
				}
			}
			this.name = data.name;
			this.hasCustomName = true;
			return respond( { status : true } );
		}
		return respond( { status : false } );
	}

}
module.exports = Player;
