'use strict';
const StreamParser = require( '../Protocol/StreamParser' );
const PacketEncoder = require( '../Protocol/PacketEncoder' );
const PacketDecoder = require( '../Protocol/PacketDecoder' );
const ClientStatus = {
	connected : 0,
	named : 1,
	inLobby : 2,
	inGame : 3
};
class Client {
	constructor( write, id, clientsStorage )
	{
		this.id = id;
		this.clientsStorage = clientsStorage;
		this.uniqueNameStorage = clientsStorage.getUniqueNameStorage();
		this.roomsStorage = clientsStorage.getRoomsStorage();
		this.write = write;

		this.streamParser = new StreamParser();
		this.packetEncoder = new PacketEncoder();
		this.packetDecoder = new PacketDecoder();

		this.status = ClientStatus.connected;
		this.name = this.uniqueNameStorage.getDefault();
		this.rinfo = null;
		this.room = null;
		this.player = null;
		this.keepAliveUDP = null;
	}

	sendID()
	{
		this.send( {
			opcode : 0x05,
			id : this.id
		} );
	}

	send( data, type = 'TCP' )
	{
		let encoded = this.packetEncoder.encode( data );
		if( encoded === false )
		{
			let msg = Buffer.from( 'Server error, could not encode packet' );
			this.write( this.packetEncoder.encode( {
				opcode : 0xe2,
				error : msg,
				length : Buffer.from( [ msg.length ] )
			} ) );
			return;
		}
		if( type === 'TCP' )
		{
			this.write( encoded );
		}
		else
		{
			this.udpSend( encoded, this.rinfo.port, this.rinfo.address );
		}

	}

	getCallbacks()
	{
		return {
			onData : this.handleData.bind( this ),
			onClose : this.disconnect.bind( this )
		};
	}

	handleData( data )
	{
		if( typeof data !== 'undefined' )
		{
			this.streamParser.appendData( data );
		}
		try
		{
			let buffer = this.streamParser.getBuffer();
			let decoded = this.packetDecoder.decode( buffer );
			if( decoded === false )
			{
				return;
			}
			this.streamParser.freeBufferToOffset( decoded.offset );
			this.respond( decoded.instruction, decoded.object );
			this.handleData();
		}
		catch( e )
		{
			let msg;
			let opcode;
			if( e.message == 0xe0 )
			{
				msg = Buffer.from( 'Unknown instruction' );
				opcode = 0xe0;
			}
			else
			{
				msg = Buffer.from( 'Parsing request error' );
				opcode = 0xe2;
			}
			this.send( {
				opcode : opcode,
				length : Buffer.from( [ msg.length ] ),
				error : msg
			} );
			this.streamParser.clearBuffer();
		}
	}

	respond( instruction, object )
	{
		let data = this[ instruction.callback ]( object );
		if( typeof instruction.response !== 'undefined' )
		{
			data.opcode = instruction.response;
			this.send( data );
		}
	}

	static fromBool( bool )
	{
		return { status : Buffer.from( [ bool ] ) };
	}

	setName( data )
	{
		if( this.uniqueNameStorage.addName( data.name ) )
		{
			if( this.status >= ClientStatus.named )
			{
				if( !this.uniqueNameStorage.removeName( this.name ) )
				{
					return Client.fromBool( false );
				}
			}
			this.name = data.name;
			this.status = ClientStatus.named;
			return Client.fromBool( true );
		}
		return Client.fromBool( false );
	}

	listGames()
	{
		return this.roomsStorage.listAvailableGames();
	}

	createRoom( data )
	{
		if( this.room === null )
		{
			let room = this.roomsStorage.addRoom( {
				name : data.name,
				password : data.password
			}, this );
			if( room !== false )
			{
				this.status = ClientStatus.inLobby;
				this.room = room;
				return Client.fromBool( true );
			}
		}
		return Client.fromBool( false );
	}

	leaveRoom()
	{
		if( this.status === ClientStatus.inLobby || this.status === ClientStatus.inGame )
		{
			if( this.room !== null )
			{
				this.room.leave( this.id );
				this.room = null;
				this.player = null;
				return true;
			}
			return false;
		}
	}

	disconnect()
	{
		if( this.keepAliveUDP !== null )
		{
			clearInterval( this.keepAliveUDP );
		}
		this.clientsStorage.removeClient( this.id );
	}

	setRoomConfig( data )
	{
		if( this.room !== null )
		{
			if( this.room.setConfig( this.id, {
					mapID : data.map,
					maxPlayers : data.players
				} ) )
			{
				return Client.fromBool( true );
			}
		}
		return Client.fromBool( false );
	}

	joinRoom( data )
	{
		if( this.room === null )
		{
			let room = this.roomsStorage.joinRoom( data, this );
			if( room !== false )
			{
				this.room = room;
				this.status = ClientStatus.inLobby;
				let retval = Client.fromBool( true );
				retval.player_id = Buffer.from( [ this.player.getPlayerID() ] );
				return retval;
			}
		}
		let retval = Client.fromBool( false );
		retval.player_id = Buffer.from( [ 0 ] );
		return retval;
	}

	setGamePhysics( data )
	{
		if( this.room !== null )
		{
			if( this.room.setPhysics( this.id, data ) )
			{
				return Client.fromBool( true );
			}
		}
		return Client.fromBool( false );
	}

	getRoomConfig()
	{
		return this.room.getRoomConfig();
	}

	setPlayerProperties( data )
	{
		if( this.player !== null )
		{
			this.player.setProperties( data );
			return Client.fromBool( true );
		}
		return Client.fromBool( false );
	}

	switchReady()
	{
		if( this.player !== null )
		{
			this.player.confirm();
			return Client.fromBool( true );
		}
		return Client.fromBool( false );
	}

	listPlayers()
	{
		if( this.room !== null )
		{
			return this.room.getPlayers();
		}
	}

	mapLoaded()
	{
		if( this.player !== null )
		{
			this.player.setMapLoaded();
			this.status = ClientStatus.inGame;
			return Client.fromBool( true );
		}
		return Client.fromBool( false );
	}

	setUDP( rinfo, send )
	{
		this.rinfo = rinfo;
		this.udpSend = send;
		this.keepAliveUDP = setInterval( this.send.bind( this, { opcode : 0x08 }, 'UDP' ), 10000 );
	}

	jump()
	{
		if( this.player !== null )
		{
			this.player.jump();
		}
	}

	switchMoveLeft()
	{
		if( this.player !== null )
		{
			this.player.moveLeft();
		}
	}

	switchMoveRight()
	{
		if( this.player !== null )
		{
			this.player.moveRight();
		}
	}

	setAngle( data )
	{
		if( this.player !== null )
		{
			this.player.setAngle( data );
		}
	}

	getWeaponsList()
	{
		if( this.player !== null )
		{
			return this.players.getWeaponsList();
		}
	}

	selectWeapon( data )
	{
		if( this.player !== null )
		{
			if( this.player.selectWeapon( data ) )
			{
				this.room.broadcastSelectedWeapon( data );
			}
		}
	}

	useWeapon( data )
	{
		if( this.player !== null )
		{
			if( this.player.useWeapon( data ) )
			{
				this.room.broadcastUseWeapon( data );
			}
		}
	}
}

module.exports.Client = Client;
module.exports.ClientStatus = ClientStatus;
