'use strict';
const SAT = require( 'sat' );
const Block = require( './Objects/Block' );
const KillingZone = require( './Objects/KillingZone' );
const PENETRATION_RATE = 5;
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
		this.explosiveInAir = null;
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
		let objects = this.game.getBugs();
		if( this.explosiveInAir !== null )
		{
			objects.push( this.explosiveInAir );
		}
		for( let i = 0 ; i < objects.length ; i++ )
		{
			let object = objects[ i ];
			if( object.isMoving() )
			{
				let hitbox = object.hitbox;
				let speedX = object.speedX;
				let speedY = object.speedY;
				let oldX = hitbox.pos.x;
				let oldY = hitbox.pos.y;
				hitbox.pos.x += speedX * diffTime;
				hitbox.pos.y += speedY * diffTime;
				let canMoveHere = this.canMoveHere( hitbox );
				let oldSpeedY = object.speedY;
				if( canMoveHere !== true )
				{
					object.speedY = 0;
					if( canMoveHere !== false )
					{
						if( canMoveHere.overlapV.x !== 0 )
						{
							object.speedX = 0;
						}
						hitbox.pos.x -= canMoveHere.overlapV.x;
						hitbox.pos.y -= canMoveHere.overlapV.y;
					}
					else
					{
						object.speedX = 0;
						hitbox.pos.x = oldX;
						hitbox.pos.y = oldY;
					}
				}
				if( this.isOnTheGround( hitbox ) )
				{
					if( object.notifyIfOnTheGround )
					{
						object.notifyOnTheGround( oldSpeedY );
					}
				}
				else
				{
					object.speedY += this.physics.gravity * diffTime;
				}
				if( object.speedX !== this.physics.maxSpeedX && object.speedX !== -this.physics.maxSpeedX )
				{
					object.speedX -= this.physics.gravity * object.speedX / this.physics.maxSpeedY * diffTime;
				}
				object.speedY -= this.physics.gravity * object.speedY / this.physics.maxSpeedY * diffTime;
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

	meleeAttack( weapon, data )
	{
		let enemies = this.getEnemyBugs( data.owner );
		enemies.forEach( ( element ) =>
		{
			if( SAT.testPolygonPolygon( weapon, element.hitbox ) )
			{
				element.decreaseHP( data.dmg );
				element.setHitVelocity( data.angle, data.power );
			}
		} );
	}

	findNearestEnemy( enemies, x )
	{
		let nearest = null;
		let shortestDistance = null;
		for( let i = 0 ; i < enemies.length ; i++ )
		{
			let distance = Math.abs( enemies[ i ].x - x );
			if( nearest === null )
			{
				shortestDistance = distance;
				nearest = enemies[ i ];
			}
			else
			{
				if( distance < shortestDistance )
				{
					shortestDistance = distance;
					nearest = enemies[ i ];
				}
			}
		}
		return nearest;
	}

	shoot( weapon, data )
	{
		let enemies = this.getEnemyBugs( data.owner );
		let enemiesOnBulletRange = [];
		enemies.forEach( ( element, index ) =>
		{
			if( SAT.testPolygonPolygon( weapon, element.hitbox ) )
			{
				enemiesOnBulletRange.push( {
					index,
					x : element.hitbox.pos.x
				} );
			}
		} );
		if( enemiesOnBulletRange.length > 0 )
		{
			let nearestEnemy = this.findNearestEnemy( enemiesOnBulletRange, weapon.pos.x );
			enemies[ nearestEnemy.index ].decreaseHP( data.dmg );
			enemies[ nearestEnemy.index ].setHitVelocity( data.angle, data.power );
		}
	}

	spawnExplosive( explosive, weaponData )
	{
		this.explosiveInAir = explosive;
	}
}
module.exports = World;
