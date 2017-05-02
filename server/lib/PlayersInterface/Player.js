'use strict';
const Sockets = require( '../GameServer/Protocol/Types' ).Sockets;
class Player {
	constructor( client, playersInterface )
	{
		this.players = playersInterface;
		this.uniqueNameStorage = this.players.getUniqueNameStorage();
		this.roomsCollection = this.players.getRoomsCollection();
		this.name = this.uniqueNameStorage.getDefault();
		this.client = client;
		this.hasCustomName = false;
		this.setDefaults();
		this.handleEvents();
	}

	setDefaults()
	{
		this.weaponsList = this.players.getWeaponsList();
		this.room = null;
		this.lobbyID = 0;
		this.isAdmin = false;
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
		this.game = null;
		this.currentWeapon = this.weaponsList[ 0 ];
		this.readyStatus = false;
		this.mapLoaded = false;
		this.bugs = [];
		this.currentBug = 0;
	}

	getPublicData()
	{
		return {
			lobbyID : this.lobbyID,
			name : this.name,
			colorR : this.color.R,
			colorG : this.color.G,
			colorB : this.color.B,
			mask : this.mask
		};
	}

	isReady()
	{
		return this.readyStatus;
	}

	handleEvents()
	{
		this.client.on( 'disconnect', () =>
		{
			if( this.hasCustomName )
			{
				this.uniqueNameStorage.removeName( this.name );
			}
			this.leaveRoom();
		} );
		this.client.on( 'error', ( error ) =>
		{
			throw error.message;
		} );
		this.client.on( 'changeName', this.setName.bind( this ) );
		this.client.on( 'leaveRoom', this.leaveRoom.bind( this ) );
		this.client.on( 'listGames', this.listGames.bind( this ) );
		this.client.on( 'createRoom', this.createRoom.bind( this ) );
		this.client.on( 'setGamePhysics', this.setPhysics.bind( this ) );
		this.client.on( 'setRoomConfig', this.setRoomConfig.bind( this ) );
		this.client.on( 'joinRoom', this.joinRoom.bind( this ) );
		this.client.on( 'getRoomConfig', this.getRoomConfig.bind( this ) );
		this.client.on( 'setPlayerProperties', this.setPlayerProperties.bind( this ) );
		this.client.on( 'switchReady', this.setReady.bind( this ) );
		this.client.on( 'listPlayers', this.listPlayers.bind( this ) );
		this.client.on( 'mapLoaded', this.setMapLoaded.bind( this ) );
		this.client.on( 'jump', this.jump.bind( this ) );
		this.client.on( 'switchMoveLeft', this.moveLeft.bind( this ) );
		this.client.on( 'switchMoveRight', this.moveRight.bind( this ) );
		this.client.on( 'setAngle', this.setAngle.bind( this ) );
		this.client.on( 'getWeaponsList', this.getWeaponsList.bind( this ) );
		this.client.on( 'selectWeapon', this.selectWeapon.bind( this ) );
		this.client.on( 'useWeapon', this.useWeapon.bind( this ) );
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
		if( this.isInLobby || this.isInGame )
		{
			if( this.isInGame )
			{
				this.bugs.forEach( ( element ) =>
				{
					element.removeYourself();
				} );
			}
			this.room.leave( this.lobbyID );
			this.setDefaults();
		}
	}

	kickFromLobby( reason )
	{
		this.client.send( {
			opcode : 0x04,
			reason
		}, Sockets.tcp );
		this.leaveRoom();
	}

	listGames( data, respond )
	{
		respond( { games : this.roomsCollection.listAvailableGames() } );
	}

	createRoom( data, respond )
	{
		respond( { status : this.roomsCollection.addRoom( data, this ) } );
	}

	assignRoom( room, id, isAdmin = false )
	{
		this.isInLobby = true;
		this.room = room;
		this.lobbyID = id;
		this.isAdmin = isAdmin;
	}

	setPhysics( data, respond )
	{
		if( this.isAdmin && this.isInLobby )
		{
			respond( { status : this.room.setPhysics( data ) } );
		}
		else
		{
			respond( { status : false } );
		}
	}

	setRoomConfig( data, respond )
	{
		if( this.isAdmin && this.isInLobby )
		{
			respond( { status : this.room.setConfig( data ) } );
		}
		else
		{
			respond( { status : false } );
		}
	}

	setReady( data, respond )
	{
		if( this.isInLobby )
		{
			this.readyStatus = !this.readyStatus;
			this.room.notifyReadyStatusChange();
			respond( { status : true } );
		}
		else
		{
			respond( { status : false } );
		}
	}

	joinRoom( data, respond )
	{
		if( this.isInLobby )
		{
			respond( { status : false } );
		}
		else
		{
			respond( {
				status : this.roomsCollection.joinRoom( data, this ),
				player_id : this.lobbyID
			} );
		}
	}

	setPlayerProperties( data, respond )
	{
		if( this.readyStatus === false )
		{
			[
				this.color.R,
				this.color.G,
				this.color.B
			] = [
				data.colorR,
				data.colorG,
				data.colorB
			];
			this.mask = data.mask;
			respond( { status : true } );
		}
		else
		{
			respond( { status : false } );
		}
	}

	getRoomConfig( data, respond )
	{
		if( this.isInLobby )
		{
			let config = this.room.getConfig();
			if( config !== false )
			{
				respond( config );
			}
		}
	}

	listPlayers( data, respond )
	{
		if( this.isInLobby )
		{
			respond( {
				readyPlayers : this.room.getReadyPlayersCount(),
				players : this.room.getPlayersList()
			} );
		}
	}

	startGame( game )
	{
		this.isInLobby = false;
		this.isInGame = true;
		this.game = game;
		this.client.send( {
			opcode : 0x30
		}, Sockets.tcp );
	}

	finishGame( leaderboard )
	{
		this.client.send( {
			opcode : 0x3a,
			players : leaderboard
		}, Sockets.tcp );
	}

	isMapLoaded()
	{
		return this.mapLoaded;
	}

	addBug( bug )
	{
		this.bugs.push( bug );
	}

	removeBug( id )
	{
		for( let i = 0 ; i < this.bugs.length ; i++ )
		{
			if( this.bugs[ i ].id === id )
			{
				this.bugs.splice( i, 1 );
			}
		}
	}

	sendGameState( state )
	{
		state.opcode = 0x32;
		this.client.send( state, Sockets.udp );
	}

	sendTimeLeft( time )
	{
		time.opcode = 0x35;
		this.client.send( time, Sockets.udp );
	}

	setMapLoaded()
	{
		if( this.isInGame )
		{
			this.mapLoaded = true;
			this.room.notifyMapLoaded();
		}
	}

	notifyRoundStart( turn )
	{
		if( turn.player_id === this.lobbyID )
		{
			this.isYourTurn = true;
			this.canAttack = true;
		}
		turn.opcode = 0x33;
		this.client.send( turn, Sockets.tcp );
	}

	notifyRoundEnd()
	{
		this.bugs[ this.currentBug ].stopMoving();
		this.currentWeapon = this.weaponsList[ 0 ];
		this.isYourTurn = false;
		this.canAttack = false;
		this.client.send( { opcode : 0x36 }, Sockets.tcp );
	}

	getWeaponsList( data, respond )
	{
		let weapons = [];
		this.weaponsList.forEach( ( element ) =>
		{
			weapons.push( {
				id : element.id,
				usages : element.usages
			} );
		} );
		respond( { weapons }, Sockets.udp );
	}

	getWeaponIndexById( id )
	{
		for( let i = 0 ; i < this.weaponsList.length ; i++ )
		{
			if( this.weaponsList[ i ].id === id )
			{
				return i;
			}
		}
		return -1;
	}

	selectWeapon( data )
	{
		let index = this.getWeaponIndexById( data.id );
		if( this.isYourTurn && index !== -1 && this.weaponsList[ index ].usages !== 0 )
		{
			this.game.sendSelectWeaponToAll( data );
		}
	}

	sendSelectWeapon( data )
	{
		data.opcode = 0x44;
		this.client.send( data, Sockets.udp );
	}

	useWeapon( data )
	{
		if( this.isYourTurn && this.currentWeapon !== null && this.canAttack )
		{
			if( this.currentWeapon.usages > 0 )
			{
				this.currentWeapon.usages--;
			}
			else if( this.currentWeapon.usages === 0 )
			{
				return;
			}
			if( this.currentWeapon.id === 0 || this.currentWeapon.id === 6 )
			{
				this.bugs[ this.currentBug ].meleeAttack( this.currentWeapon, data.param );
			}
			if( this.currentWeapon.id === 1 )
			{
				for( let i = 0 ; i < this.bugs.length ; i++ )
				{
					if( data.param === this.bugs[ i ].id )
					{
						this.bugs[ this.currentBug ].stopMoving();
						this.currentBug = i;
						this.game.sendUseWeaponToAll( data );
						break;
					}
				}
			}
			if( this.currentWeapon.id === 3 || this.currentWeapon.id === 4 || this.currentWeapon.id === 5 || this.currentWeapon.id === 7 || this.currentWeapon.id === 8 || this.currentWeapon.id === 9 )
			{
				return;
			}
			if( this.currentWeapon.notEndRound === false )
			{
				this.endTurn( data );
			}
		}
	}

	endTurn( data )
	{
		this.game.sendUseWeaponToAll( data );
		this.canAttack = false;
		this.game.endTurn();
	}

	sendUseWeapon( data )
	{
		data.opcode = 0x45;
		this.client.send( data, Sockets.udp );
	}

	chooseBug()
	{
		this.currentBug = ( this.currentBug + 1) % this.bugs.length;
		return this.bugs[ this.currentBug ].id;
	}

	jump()
	{
		if( this.isYourTurn )
		{
			this.bugs[ this.currentBug ].jump();
		}
	}

	moveLeft()
	{
		if( this.isYourTurn )
		{
			this.bugs[ this.currentBug ].moveLeft();
		}
	}

	moveRight()
	{
		if( this.isYourTurn )
		{
			this.bugs[ this.currentBug ].moveRight();
		}
	}

	setAngle( data )
	{
		if( this.isYourTurn )
		{
			this.bugs[ this.currentBug ].setAngle( data );
		}
	}
}
module.exports = Player;
