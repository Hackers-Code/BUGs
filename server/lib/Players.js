const Player = require( './Player.js' );
const UniqueID = require( './UniqueKeyGenerator.js' );
const UniqueName = require( './UniqueNameStorage.js' );

class Players {
	constructor()
	{
		this.players = [];
		this.keyGenerator = new UniqueID( 4 );
		this.nameStorage = new UniqueName( 20 );
	}

	isFree( id )
	{
		let index = this.findPlayerById( id );
		if( index !== -1 )
		{
			return this.players[ index ].isFree();
		}
		else
		{
			console.log( 'Player with id: ' + id.toString( 'hex' ) + ' not found' );
			return false;
		}
	}

	addGameToPlayer( playerID, gameID )
	{
		let index = this.findPlayerById( playerID );
		if( index !== -1 )
		{
			this.players[ index ].addToGame( gameID );
			return true;
		}
		else
		{
			console.log( 'Player with id: ' + id.toString( 'hex' ) + ' not found' );
			return false;
		}
	}

	getPlayerGame( playerID )
	{
		let index = this.findPlayerById( playerID );
		if( index !== -1 )
		{
			return this.players[ index ].getGame();
		}
		else
		{
			console.log( 'Player with id: ' + id.toString( 'hex' ) + ' not found' );
			return false;
		}
	}

	addPlayer( socket )
	{
		let player = new Player( socket );
		this.players.push( player );
	}

	addId( sockID )
	{
		let index = this.findPlayerBySocketId( sockID );
		if( index !== -1 )
		{
			let id = this.keyGenerator.generateKey();
			this.players[ index ].setId( id );
			return id;
		}
		else
		{
			console.log( 'Player with socket id: ' + sockID + ' not found' );
			return false;
		}

	}

	addNickname( id, name )
	{
		let index = this.findPlayerById( id );
		if( index !== -1 )
		{
			if( this.nameStorage.checkName( name ) )
			{
				this.players[ index ].setName( name );
				return true;
			}
			else
			{
				console.log( 'Name is not unique' );
				return false;
			}

		}
		else
		{
			console.log( 'Player with id: ' + id.toString( 'hex' ) + ' not found' );
		}
	}

	findPlayerById( id )
	{
		console.log( 'Looking for player with id ' + id.toString( 'hex' ) );
		for( let i = 0 ; i < this.players.length ; i++ )
		{
			if( id.compare( this.players[ i ].id ) === 0 )
			{
				return i;
			}
		}
		return -1;
	}

	findPlayerBySocketId( sockID )
	{
		console.log( 'Looking for player with socket id ' + sockID );
		for( let i = 0 ; i < this.players.length ; i++ )
		{
			if( this.players[ i ].socket.id === sockID )
			{
				return i;
			}
		}
		return -1;
	}
}

module.exports = Players;