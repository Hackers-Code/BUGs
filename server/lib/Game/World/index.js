'use strict';
const SAT = require( 'sat' );
const Block = require( './Objects/Block' );
const KillingZone = require( './Objects/KillingZone' );
const START_BUG_HP = require( './Objects/Bug' ).START_HP;
class World {
	constructor( game )
	{
		this.game = game;
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

	getGame()
	{
		return this.game;
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
		for( let i = 0 ; i < this.blocks.length ; i++ )
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
				if( SAT.testPolygonPolygon( hitbox, this.blocks[ i ].hitbox, response ) )
				{
					return response;
				}
			}
			return true;
		}
		return false;
	}

	simulate( diffTime )
	{
		let bugs = this.game.getBugs();
		for( let i = 0 ; i < bugs.length ; i++ )
		{
			let bug = bugs[ i ];
			if( bug.isMoving() )
			{
				let hitbox = bug.hitbox;
				let speedX = bug.speedX;
				let speedY = bug.speedY;
				let oldX = hitbox.pos.x;
				let oldY = hitbox.pos.y;
				hitbox.pos.x += speedX * diffTime;
				hitbox.pos.y += speedY * diffTime;
				let canMoveHere = this.canMoveHere( hitbox );
				if( canMoveHere !== true )
				{
					bug.speedY = 0;
					if( canMoveHere !== false )
					{
						if( canMoveHere.overlapV.x !== 0 )
						{
							bug.speedX = 0;
						}
						hitbox.pos.x -= canMoveHere.overlapV.x;
						hitbox.pos.y -= canMoveHere.overlapV.y;
					}
					else
					{
						bug.speedX = 0;
						hitbox.pos.x = oldX;
						hitbox.pos.y = oldY;
					}
				}
				if( this.isOnTheGround( hitbox ) )
				{
					if( speedY >= this.physics.maxSpeedY / 2 )
					{
						bug.decreaseHP( START_BUG_HP * (speedY / this.physics.maxSpeedY) );
					}
					bug.isOnTheGround = true;
				}
				else
				{
					if( bug.speedY + this.physics.gravity * diffTime < this.physics.maxSpeedY )
					{
						bug.speedY += this.physics.gravity * diffTime;
					}
				}
			}
		}
	}

	getEnemyBugs( owner )
	{
		let bugs = this.game.getBugs();
		let enemies = [];
		bugs.forEach( ( element ) =>
		{
			if( element.owner !== owner )
			{
				enemies.push( element );
			}
		} );
		return enemies;
	}

	meleeAttack( weapon, owner )
	{
		let enemies = this.getEnemyBugs( owner );
		enemies.forEach( ( element ) =>
		{
			if( SAT.testPolygonPolygon( weapon, element.hitbox ) )
			{
				element.decreaseHP( weapon.dmg );
			}
		} );
	}
}
module.exports = World;
