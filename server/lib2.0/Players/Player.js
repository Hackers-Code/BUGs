class Player {
	constructor( client, playersStorage )
	{
		this.playersStorage = playersStorage;
		this.uniqueNameStorage = playersStorage.getUniqueNameStorage();
		this.roomsStorage = playersStorage.getRoomsStorage();
		this.name = this.uniqueNameStorage.getDefault();
		this.client = client;
		this.hasCustomName = false;
		this.setDefaults();
		this.handleEvents();
	}

	setDefaults()
	{
		this.room = null;
		this.roomClientId = -1;
		this.isInLobby = false;
		this.isInGame = false;
		this.color = {
			R : 0,
			G : 0,
			B : 0
		};
		this.mask = 0;
		this.isYourTurn = false;
		this.canAttack = false;
		this.world = null;
		this.currentWeapon = null;
		this.readyStatus = false;
		this.mapLoaded = false;
		this.bugs = [];
		this.currentBug = 0;
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
		this.client.on( 'leaveRoom', this.leaveRoom.bind( this ) );
		this.client.on( 'listGames', this.listGames.bind( this ) );
		this.client.on( 'createRoom', this.createRoom.bind( this ) );
	}

	setName( data, respond )
	{
		if( this.uniqueNameStorage.addName( data.name ) )
		{
			if( this.hasCustomName === true && !this.uniqueNameStorage.removeName( this.name ) )
			{
				respond( { status : false } );
			}
			else
			{
				this.name = data.name;
				this.hasCustomName = true;
				respond( { status : true } );
			}
		}
		else
		{
			respond( { status : false } );
		}
	}

	leaveRoom()
	{
		//TODO:room.leave()
		this.setDefaults();
	}

	listGames( data, respond )
	{
		respond( { games : this.roomsStorage.listAvailableGames() } );
	}

	createRoom( data, respond )
	{
		respond( { status : this.roomsStorage.addRoom( data, this ) } );
	}
}
module.exports = Player;
