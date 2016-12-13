'use strict';
const MapParser = require( './MapParser' );
const Worm = require( './Worm' );

class Game {
	constructor()
	{
		this.mapParser = new MapParser();
		this.players = [];
		this.worms = [];
		this.wormsPerPlayer = 5;
	}

	loadMap( id )
	{
		this.mapParser.loadMap( id );
	}

	init( players )
	{
		this.players = players;
		for( let i = 0 ; i < players.length ; i++ )
		{
			for( let j = 0 ; j < this.wormsPerPlayer ; j++ )
			{
				let worm = new Worm( this.mapParser.getUniqueSpawn(), i, i * 5 + j );
				this.worms.push( worm );
			}
		}
		this.updateWormsList();
	}

	updateWormsList()
	{

	}

	getWorms()
	{
		return this.wormsList;
	}

	checkCollisionLeft()
	{

	}

	checkCollisionRight()
	{

	}

	checkCollisionTop()
	{

	}

	checkCollisionBottom()
	{

	}
}

module.exports = Game;
