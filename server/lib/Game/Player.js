const Worm = require( './Worm' );
const SearchEngine = require( '../Utils/SearchEngine' );
class Player {
	constructor( client, playerID, weapons )
	{
		client.player = this;
		this.send = client.send.bind( client );
		this.id = client.id;
		this.playerID = playerID;
		this.confirmed = false;
		this.mapLoaded = false;
		this.name = client.name;
		this.worms = [];
		this.weapons = weapons;
		this.actualWorm = 0;
		this.colour = {
			R : Buffer.from( [ 0 ] ),
			G : Buffer.from( [ 0 ] ),
			B : Buffer.from( [ 0 ] )
		};
		this.mask = Buffer.from( [ 0 ] );
		this.isYourTurn = false;
		this.world = null;
		this.currentWeapon = null;
	}

	getWeaponsList()
	{
		let count = Buffer.alloc( 4 );
		count.writeUInt32BE( this.weapons.length, 0 );
		let weapons = [];
		this.weapons.forEach( ( element ) =>
		{
			weapons.push( {
				id : Buffer.from( [ element.id ] ),
				usages : Buffer.from( [ element.usages ] )
			} );
		} );
		return {
			count,
			weapons
		};
	}

	getPlayerID()
	{
		return this.playerID;
	}

	endTurn()
	{
		this.isYourTurn = false;
		this.worms[ this.actualWorm ].stop();
	}

	startTurn()
	{
		this.isYourTurn = true;
	}

	addWorm( spawn, id, physics )
	{
		let worm = new Worm( spawn, this.playerID, id, physics );
		this.worms.push( worm );
	}

	chooseWorm()
	{
		this.actualWorm = ( this.actualWorm + 1 ) % this.worms.length;
		return this.worms[ this.actualWorm ].getID();
	}

	setProperties( data )
	{
		this.colour.R = data.colourR;
		this.colour.G = data.colourG;
		this.colour.B = data.colourB;
		this.mask = data.mask;
	}

	confirm()
	{
		this.confirmed = !this.confirmed;
	}

	setMapLoaded()
	{
		this.mapLoaded = true;
	}

	getWorms()
	{
		return this.worms;
	}

	update( diffTime )
	{
		for( let i = 0 ; i < this.worms.length ; i++ )
		{
			let worm = this.worms[ i ];
			if( this.world.checkCollisionBottom( worm.y, worm.height, worm.x ) === false )
			{
				worm.isFalling = true;
			}
			if( worm.isMoving() )
			{
				let nextX = worm.x + worm.speedX * (diffTime / 1000);
				if( worm.isMovingLeft || worm.isMovingRight )
				{
					let collision;
					if( worm.isMovingLeft )
					{
						collision = this.world.checkCollisionLeft( worm.y, nextX );
					}
					else if( worm.isMovingRight )
					{
						collision = this.world.checkCollisionRight( worm.y, nextX, worm.width );
					}
					if( collision !== false )
					{
						worm.x = collision;
						worm.speedX = 0;
					}
					else
					{
						worm.x = nextX;
					}
				}

				if( worm.isJumping )
				{
					let nextY = worm.y + worm.speedY * (diffTime / 1000);
					let collision = this.world.checkCollisionTop( nextY, worm.x );
					if( collision !== false )
					{
						worm.y = collision;
						worm.speedY = 0;
					}
					else
					{
						worm.speedY += worm.accelerationY * (diffTime / 1000);
						worm.y = nextY;
					}
					if( worm.speedY >= 0 )
					{
						worm.isJumping = false;
						worm.isFalling = true;
					}
				}

				else if( worm.isFalling )
				{
					if( worm.speedY > worm.maxSpeedY )
					{
						worm.speedY = worm.maxSpeedY;
					}
					let nextY = worm.y + worm.speedY * (diffTime / 1000);
					let collision = this.world.checkCollisionBottom( nextY, worm.height, worm.x );
					if( collision !== false )
					{
						worm.y = collision;
						worm.speedY = 0;
						worm.isFalling = false;
					}
					else
					{
						worm.speedY += worm.accelerationY * (diffTime / 1000);
						worm.y = nextY;
					}
				}
			}
		}
	}

	addWorld( world )
	{
		this.world = world;
	}

	jump()
	{
		let worm = this.worms[ this.actualWorm ];
		if( this.isYourTurn && this.world.checkCollisionBottom( worm.y, worm.height, worm.x ) !== false )
		{
			worm.jump();
		}
	}

	moveLeft()
	{
		if( this.isYourTurn )
		{
			this.worms[ this.actualWorm ].moveLeft();
		}
	}

	moveRight()
	{
		if( this.isYourTurn )
		{
			this.worms[ this.actualWorm ].moveRight();
		}
	}

	setAngle( data )
	{
		if( this.isYourTurn )
		{
			this.worms[ this.actualWorm ].setAngle( data );
		}
	}

	selectWeapon( data )
	{
		if( this.isYourTurn )
		{
			let id = data.id.readUInt8( 0 );
			let index = SearchEngine.findByNumericId( id, this.weapons );
			if( index !== -1 )
			{
				this.currentWeapon = this.weapons[ index ];
				return true;
			}
		}
		return false;
	}

	useWeapon( data )
	{
		if( this.isYourTurn )
		{
			let param = data.param.readUInt8( 0 );
			if( this.currentWeapon === null )
			{
				return false;
			}
			switch( this.currentWeapon.id )
			{
				case 1:
				{
					let index = SearchEngine.findByNumericId( param, this.worms );
					if( index !== -1 )
					{
						this.actualWorm = index;
					}
					break;
				}
				case 2:
				{
					break;
				}
				default:
				{
					console.log( 'unsupported weapon' );
				}
			}
		}
		return false;
	}
}

module.exports = Player;
