'use strict';
const SAT = require( 'sat' );
const Block = require( './Objects/Block' );
const KillingZone = require( './Objects/KillingZone' );
class World {
	constructor( game )
	{
		this.game = game;
		this.bugs = game.getBugs();
		this.parsedMap = game.getMap();
		this.physics = game.getPhysics();
		this.spawns = this.parsedMap.spawns || [];
		this.blocks = [];
		this.killingZones = [];
		this.bounds = new SAT.Box( new SAT.Vector( 0, 0 ), this.parsedMap.metadata[ 0 ].width,
			this.parsedMap.metadata[ 0 ].height ).toPolygon();
		this.addBlocks();
		this.addKillingZones();
	}

	getPhysics()
	{
		return this.physics;
	}

	addBlocks()
	{
		if( typeof this.parsedMap[ 'blocks' ] !== 'undefined' )
		{
			this.parsedMap[ 'blocks' ].forEach( ( element ) =>
			{
				this[ 'blocks' ].push( new Block( element ) );
			} );
		}
	}

	addKillingZones()
	{
		if( typeof this.parsedMap[ 'killingZones' ] !== 'undefined' )
		{
			this.parsedMap[ 'killingZones' ].forEach( ( element ) =>
			{
				this[ 'killingZones' ].push( new KillingZone( element ) );
			} );
		}
	}

	popRandomSpawn()
	{
		if( this.spawns.length === 0 )
		{
			throw new Error( 'There is no spawn on map' );
		}
		let randomIndex = Math.floor( Math.random() * this.spawns.length );
		let retval = this.spawns[ randomIndex ];
		this.spawns.splice( randomIndex, 1 );
		return retval;
	}

	isOnTheGround( hitbox )
	{
		for( let i = 0 ; i < this.blocks ; i++ )
		{
			let response = new SAT.Response();
			let isCollision = SAT.testPolygonPolygon( this.blocks[ i ].hitbox, hitbox, response );
			if( isCollision )
			{
				return response.overlap === 0;
			}
		}
		return false;
	}

	canMoveHere( hitbox )
	{
		let response = new SAT.Response();
		if( SAT.testPolygonPolygon( hitbox, this.bounds, response ) && response.aInB === true )
		{
			response.clear();
			for( let i = 0 ; i < this.blocks.length ; i++ )
			{
				if( SAT.testPolygonPolygon( hitbox, this.blocks[ i ], response ) )
				{
					return response;
				}
			}
		}
		return true;
	}

	simulate( diffTime )
	{
		for( let i = 0 ; i <= this.bugs ; i++ )
		{
			if( this.bugs.isMoving() )
			{
				let bug = this.bugs[ i ];
				let hitbox = bug.hitbox;
				let speedX = bug.speedX;
				let speedY = bug.speedY;
				hitbox.translate( bug.speedX, bug.speedY );
				let canMoveHere = this.canMoveHere( hitbox );
				if( canMoveHere !== true )
				{
					bug.speedX = 0;
					bug.speedY = 0;
					hitbox.translate( -canMoveHere.overlapV.x, -canMoveHere.overlapV.y );
				}
				if( this.isOnTheGround( hitbox ) )
				{
					bug.isOnTheGround = true;
				}
			}
		}
	}
}
module.exports = World;
