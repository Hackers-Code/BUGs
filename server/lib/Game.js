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
		this.maxFramesPerSecond = 300;
		this.lastFrameTime = 0;
		this.move = 0;
		this.worm = 0;
		this.timeleft = 60;
		this.lastClockTime = 0;
	}

	whoseMove()
	{
		let worm_id = Buffer.alloc( 1 );
		worm_id.writeInt8( this.move * this.players.length + this.worm, 0 );
		this.players[ this.move ].response.send( {
			opcode : 0x19,
			worm_id : worm_id
		} );
		this.players[ this.move ].isYourMove = true;
		this.lastClockTime = new Date().getTime();
		this.updateMove();
	}

	updateMove()
	{
		this.timeleft -= ((new Date().getTime() - this.lastClockTime) / 1000);
		this.lastClockTime = new Date().getTime();
		if( this.timeleft <= 0 )
		{
			this.players[ this.move ].response.send( {
				opcode : 0x1c
			} );
			this.players[ this.move ].isYourMove = false;
			this.move = ++this.move % this.players.length;
			if( this.move === 0 )
			{
				this.worm = ++this.worm % this.wormsPerPlayer;
			}
			this.whoseMove();
			return;
		}
		setTimeout( this.updateMove.bind( this ), 500 );
	}

	getTimeLeft()
	{
		return parseInt( this.timeleft );
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
		let count = Buffer.alloc( 4 );
		count.writeInt32BE( this.worms.length, 0 );
		let worms = [];
		for( let i = 0 ; i < this.worms.length ; i++ )
		{
			let id = Buffer.alloc( 1 );
			id.writeInt8( this.worms[ i ].id, 0 );
			let owner = Buffer.alloc( 1 );
			owner.writeInt8( this.worms[ i ].owner, 0 );
			let hp = Buffer.alloc( 1 );
			hp.writeUInt8( this.worms[ i ].hp, 0 );
			let x = Buffer.alloc( 4 );
			x.writeInt32BE( this.worms[ i ].x, 0 );
			let y = Buffer.alloc( 4 );
			y.writeInt32BE( this.worms[ i ].y, 0 );
			worms.push( {
				worm_id : id,
				owner_id : owner,
				hp : hp,
				x : x,
				y : y
			} );
		}
		this.wormsList = {
			worms_count : count,
			worms : worms
		};
	}

	getWorms()
	{
		return this.wormsList;
	}

	start()
	{
		this.lastFrameTime = new Date().getTime();
		this.update();
		this.whoseMove();
	}

	update()
	{
		let diffTime = new Date().getTime() - this.lastFrameTime;
		if( diffTime >= 1000 / this.maxFramesPerSecond )
		{
			for( let i = 0 ; i < this.worms.length ; i++ )
			{
				if( !this.checkCollisionBottom( this.worms[ i ] ) )
				{
					if( this.checkCollisionTop( this.worms[ i ] ) )
					{
						this.worms[ i ].speedY = 0;
					}
					else
					{
						this.worms[ i ].speedY += this.worms[ i ].accelerationY * (diffTime / 1000);
						if( this.worms[ i ].speedY > this.worms[ i ].maxSpeedY )
						{
							this.worms[ i ].speedY = this.worms[ i ].maxSpeedY;
						}
					}
					this.worms[ i ].y += this.worms[ i ].speedY * (diffTime / 1000);
					if( this.checkCollisionBottom( this.worms[ i ] ) )
					{
						this.worms[ i ].speedY = 0;
					}
				}
			}
			this.updateWormsList();
			this.lastFrameTime = new Date().getTime();
		}
		setImmediate( this.update.bind( this ) );
	}

	checkCollisionLeft( worm )
	{
		for( let i = 0 ; i < this.mapParser.blocks.length ; i++ )
		{
			let block = this.mapParser.blocks[ i ];
			if( (worm.y > block.y) && (worm.y < block.y + block.height) && ( worm.x < block.x ) && ( worm.x > block.x + block.width) )
			{
				return true;
			}
		}
		return false;
	}

	checkCollisionRight( worm )
	{
		for( let i = 0 ; i < this.mapParser.blocks.length ; i++ )
		{
			let block = this.mapParser.blocks[ i ];
			if( (worm.y > block.y) && (worm.y < block.y + block.height) && ( worm.x > block.x ) && ( worm.x < block.x + block.width) )
			{
				return true;
			}
		}
		return false;
	}

	checkCollisionTop( worm )
	{
		for( let i = 0 ; i < this.mapParser.blocks.length ; i++ )
		{
			let block = this.mapParser.blocks[ i ];
			if( (worm.y > block.y) && (worm.y < block.y + block.height) && ( worm.x > block.x ) && ( worm.x < block.x + block.width) )
			{
				return true;
			}
		}
		return false;
	}

	checkCollisionBottom( worm )
	{
		for( let i = 0 ; i < this.mapParser.blocks.length ; i++ )
		{
			let block = this.mapParser.blocks[ i ];
			if( (worm.y + worm.height < block.y + block.height) && (worm.y + worm.height > block.y) && ( worm.x > block.x ) && ( worm.x < block.x + block.width) )
			{
				return true;
			}
		}
		return false;
	}

	jump()
	{
		if( this.worms[ this.worm ].speedY === 0 )
		{
			this.worms[ this.worm ].speedY = -300;
		}
	}
}

module.exports = Game;
