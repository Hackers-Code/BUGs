const RoomStatus = {
	notInitialized : 1,
	waitingForPlayers : 2,
	waitingForAccepting : 3,
	inGame : 4
};

class Room {
	constructor( id, name, password, ownerID )
	{
		this.id = Buffer.from( id );
		this.name = Buffer.from( name );
		this.password = Buffer.from( password );
		this.ownerID = ownerID;
		this.players = [ ownerID ];
		this.status = RoomStatus.notInitialized;
		this.maxPlayers = 0;
		this.mapID = null;
	}

	checkPrivileges( playerID )
	{
		if( playerID.compare( this.ownerID ) === 0 )
		{
			return true;
		}
		else
		{
			console.log( 'Insufficient privileges to change settings' );
			return false;
		}
	}

	setConfig( playerID, mapID, maxPlayers )
	{
		if( this.checkPrivileges( playerID ) )
		{
			if( maxPlayers.readInt8( 0 ) >= 2 || maxPlayers.readInt8( 0 ) <= 4 )
			{
				if( mapID instanceof Buffer )
				{
					this.mapID = mapID;
					this.maxPlayers = maxPlayers.readInt8( 0 );
					this.status = RoomStatus.waitingForPlayers;
					return true;
				}
				else
				{
					console.log( 'Map ID must be a buffer' );
					return false;
				}
			}
			else
			{
				console.log( 'Not valid players amount' );
				return false;
			}
		}
		else
		{
			return false;
		}
	}

	loginToRoom( id, password )
	{
		if( password.compare( this.password ) === 0 )
		{
			if( this.players.length <= this.maxPlayers )
			{
				this.players.push( id );
				if( this.players.length === this.maxPlayers )
				{
					this.status = RoomStatus.waitingForAccepting;
				}
				return true;
			}
			else
			{
				console.log( 'Too many players in room' );
				return false;
			}
		}
		else
		{
			console.log( 'Wrong password' );
			return false;
		}
	}

	getCurrentMap()
	{
		return this.mapID;
	}

	isWaitingForPlayers()
	{
		if( this.status === RoomStatus.waitingForPlayers )
		{
			return {
				id : this.id,
				name : this.name
			};
		}
		else
		{
			return false;
		}
	}
}

module.exports = Room;