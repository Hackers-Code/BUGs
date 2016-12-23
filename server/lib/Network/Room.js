'use strict';

const Status = {
	uninitialized : 0,
	waitingForPlayers : 1,
	waitingForConfirming : 2,
	inGame : 3
};
const SearchEngine = require( './../Utils/SearchEngine' );
class Room {
	constructor( settings, client, id, storage )
	{
		this.id = id;
		this.name = settings.name;
		this.admin = client.id;
		this.storage = storage;
		this.clients = [];
		this.clients.push( client );
		this.status = Status.uninitialized;
	}

	leave( id )
	{
		if( this.status < Status.inGame )
		{
			if( id == this.admin )
			{
				this.storage.removeRoom( this.id );
				let adminIndex = SearchEngine.findByUniqueID( this.clients, id );
				if( adminIndex !== false && adminIndex !== -1 )
				{
					this.clients.splice( adminIndex, 1 );
				}
				let reason = Buffer.alloc( 30 );
				reason.write( 'Admin left lobby!' );
				this.clients.forEach( ( element ) =>
				{
					element.response.send( {
						opcode : 0x04,
						reason : reason
					} );
				} );
			}
			else
			{
				let index = SearchEngine.findByUniqueID( this.clients, id );
				if( index !== false && index !== -1 )
				{
					this.clients.splice( index, 1 );
					if( this.status === Status.waitingForConfirming )
					{
						this.status = Status.waitingForPlayers;
					}
				}
			}
		}
		else
		{
			let index = SearchEngine.findByUniqueID( this.clients, id );
			if( index !== false && index !== -1 )
			{
				this.clients.splice( index, 1 );
			}
		}

	}

	isAvailable()
	{
		if( this.status === Status.waitingForPlayers )
		{
			return {
				name : this.name,
				id : this.id
			};
		}
		else
		{
			return false;
		}
	}
}

module.exports = Room;
/*TODO:Variables that might be useful
 this.password = settings.password;
 this.mapID = 1;
 this.maxPlayers = 2;
 this.playersList = null;
 this.game = new Game();
 */
/*TODO:Methods to implement
 setConfig( id, config )
 {
 if( this.status === Status.uninitialized )
 {
 if( id.compare( this.adminID ) === 0 )
 {
 this.mapID = config.mapID.readInt32BE( 0 );
 if( !fs.existsSync( __dirname + '/../maps/' + this.mapID + '.map' ) )
 {
 return false;
 }
 this.maxPlayers = config.maxPlayers.readInt8( 0 );
 this.status = Status.waitingForPlayers;
 return true;
 }
 else
 {
 return false;
 }
 }
 return false;
 }

 joinGame( password, client )
 {
 if( this.status === Status.waitingForPlayers )
 {
 if( password.compare( this.password ) === 0 )
 {
 this.clients.push( client );
 if( this.clients.length === this.maxPlayers )
 {
 this.status = Status.waitingForConfirming;
 this.checkIfAllConfirmed();
 }
 return true;
 }
 return false;
 }
 return false;
 }

 checkIfAllConfirmed()
 {
 for( let i = 0 ; i < this.clients.length ; i++ )
 {
 if( this.clients[ i ].confirmedGame === false )
 {
 setTimeout( this.checkIfAllConfirmed.bind( this ), 1000 );
 return;
 }
 }
 this.status = Status.inGame;
 this.preparePlayersList();
 this.game.loadMap( this.mapID );
 this.game.init( this.clients );
 for( let i = 0 ; i < this.clients.length ; i++ )
 {
 this.clients[ i ].response.send( { opcode : 0x14 } );
 }
 this.checkIfAllLoadedMap();
 }

 checkIfAllLoadedMap()
 {
 for( let i = 0 ; i < this.clients.length ; i++ )
 {
 if( this.clients[ i ].mapLoaded === false )
 {
 setTimeout( this.checkIfAllLoadedMap.bind( this ), 100 );
 return;
 }
 }
 setTimeout( this.game.start.bind( this.game ), 3000 );
 }

 preparePlayersList()
 {
 let count = Buffer.alloc( 4 );
 count.writeInt32BE( this.clients.length, 0 );
 let clients = [];
 for( let i = 0 ; i < this.clients.length ; i++ )
 {
 let id = Buffer.alloc( 1 );
 id.writeInt8( i, 0 );
 clients.push( {
 id : id,
 name : this.clients[ i ].name
 } );
 }
 this.playersList = {
 players_count : count,
 players : clients
 };
 }

 getPlayers()
 {
 return this.playersList;
 }

 getWorms()
 {
 return this.game.getWorms();
 }

 getTimeLeft()
 {
 return this.game.getTimeLeft();
 }

 jump()
 {
 return this.game.jump();
 }
 */
