
class Client {
	constructor( socket, clientsStorage )
	{
		this.socket = socket;
		this.clientsStorage = clientsStorage;
		this.request = new Request( this, socket );
		this.response = new Response( socket );
		this.id = null;
		this.name = Buffer.alloc( 20 );
		this.hasCustomName = false;
		this.room = null;
		this.confirmedGame = false;
		this.mapLoaded = false;
		this.isYourMove = false;
		this.socket.on( 'data', this.request.handleRequest.bind( this.request ) );
		this.socket.on( 'error', function()
		{
		} );
		this.socket.on( 'close', this.handleSocketClose.bind( this ) );
	}

	setRoomSettings( data )
	{
		let status = 0;
		if( this.room !== null )
		{
			if( this.room.setConfig( this.id, {
					mapID : data.mapID,
					maxPlayers : data.maxPlayers
				} ) )
			{
				status = 1;
			}
		}
		else
		{

		}
		this.response.send( {
			opcode : 0xA,
			status : Buffer.from( [ status ] )
		} );
	}

	joinGame( data )
	{
		let retval = {
			opcode : 0x11,
			status : 0
		};
		if( this.room === null )
		{
			let room = this.clientsStorage.joinGame( {
				roomID : data.roomID,
				password : data.password
			}, this );
			if( room !== false )
			{
				this.room = room;
				retval.status = 1;
				retval.mapID = Buffer.alloc( 4 );
				retval.mapID.writeInt32BE( room.mapID, 0 );
			}
		}
		else
		{

		}
		retval.status = Buffer.from( [ retval.status ] );
		this.response.send( retval );
	}

	confirmGame()
	{
		if( this.room !== null )
		{
			this.confirmedGame = !this.confirmedGame;
			this.response.send( {
				opcode : 0x13
			} );
		}
		else
		{

		}
	}

	getPlayers()
	{
		if( this.room !== null )
		{
			let retval = this.room.getPlayers();
			retval.opcode = 0x16;
			this.response.send( retval );
		}
		else
		{

		}
	}

	getWorms()
	{
		if( this.room !== null )
		{
			if( this.mapLoaded === false )
			{
				this.mapLoaded = true;
			}
			let retval = this.room.getWorms();
			retval.opcode = 0x18;
			this.response.send( retval );
		}
		else
		{

		}
	}

	getTimeLeft()
	{
		if( this.room !== null )
		{
			let seconds = Buffer.alloc( 1 );
			seconds.writeUInt8( this.room.getTimeLeft(), 0 );
			this.response.send( {
				opcode : 0x1b,
				seconds : seconds
			} );
		}
		else
		{

		}
	}

	jump()
	{
		if( this.room !== null && this.isYourMove === true )
		{
			this.room.jump();
		}
		else
		{

		}
	}

	switchMoveLeft()
	{
		if( this.room !== null && this.isYourMove === true )
		{
			this.room.switchMoveLeft();
		}
		else
		{

		}
	}

	switchMoveRight()
	{
		if( this.room !== null && this.isYourMove === true )
		{
			this.room.switchMoveRight();
		}
		else
		{
		}
	}
}

module.exports = Client;
