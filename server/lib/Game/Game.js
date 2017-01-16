const MapInterface = require( '../MapInterface/MapInterface' );
const World = require( '../World/World' );
class Game {
	constructor( players )
	{
		this.players = players;
		this.world = null;
		this.timeleft = 60;
		this.lastClockTime = 0;
		this.frame = 0;
		this.lastFrameTime = 0;
		this.gravity = 475;
		this.maxSpeedX = 100;
		this.maxSpeedY = 875;
		this.jumpHeight = -300;
		this.wormsPerPlayer = 5;
		this.maxFramesPerSecond = 300;
		this.whoseTurnID = 0;
		this.wormID = 0;
		this.wormsList = null;
		this.updateWormsList();
	}

	setPhysics( physics )
	{
		this.gravity = physics.gravity;
		this.maxSpeedX = physics.maxSpeedX;
		this.maxSpeedY = physics.maxSpeedY;
		this.jumpHeight = physics.jumpHeight;
	}

	getPhysics()
	{
		return {
			gravity : this.gravity,
			maxSpeedX : this.maxSpeedX,
			maxSpeedY : this.maxSpeedY,
			jumpHeight : this.jumpHeight
		};
	}

	loadMap( id )
	{
		MapInterface.getParsedMap( id, this.initWorld.bind( this ) );
	}

	initWorld( err, data )
	{
		if( err )
		{
			throw err;
		}
		this.world = new World( data );
		this.players.forEach( ( element ) =>
		{
			element.addWorld( this.world );
			for( let i = 0 ; i < this.wormsPerPlayer ; i++ )
			{
				element.addWorm( this.world.getUniqueSpawn(), this.wormID++, {
					gravity : this.gravity,
					maxSpeedX : this.maxSpeedX,
					maxSpeedY : this.maxSpeedY,
					jumpHeight : this.jumpHeight
				} );
			}

		} );
		this.updateWormsList();
	}

	start()
	{
		this.lastFrameTime = new Date().getTime();
		this.update();
		this.whoseTurn();
	}

	updateTurn()
	{
		this.timeleft -= ((new Date().getTime() - this.lastClockTime) / 1000);
		this.lastClockTime = new Date().getTime();
		if( this.timeleft <= 0 )
		{
			this.players[ this.whoseTurnID ].response.send( {
				opcode : 0x36
			} );
			this.players[ this.whoseTurnID ].isYourTurn = false;
			this.whoseTurnID = ++this.whoseTurnID % this.players.length;
			this.whoseTurn();
			return;
		}
		setTimeout( this.updateTurn.bind( this ), 500 );
	}

	whoseTurn()
	{
		let worm_id = Buffer.alloc( 1 );
		worm_id.writeUInt8( this.players[ this.whoseTurnID ].chooseWorm(), 0 );
		this.players[ this.whoseTurnID ].response.send( {
			opcode : 0x33,
			worm_id : worm_id
		} );
		this.players[ this.whoseTurnID ].isYourMove = true;
		this.timeleft = 60;
		this.lastClockTime = new Date().getTime();
		this.updateTurn();
	}

	getTimeLeft()
	{
		let tick = Buffer.alloc( 4 );
		tick.writeUInt32BE( this.frame, 0 );
		return {
			opcode : Buffer.from( [ 0x35 ] ),
			seconds : Buffer.from( [ parseInt( this.timeleft ) ] ),
			tick
		};
	}

	update()
	{
		let diffTime = new Date().getTime() - this.lastFrameTime;
		if( diffTime >= 1000 / this.maxFramesPerSecond )
		{
			this.players.forEach( ( element ) =>
			{
				element.update( diffTime );
			} );
			this.frames++;
			this.updateWormsList();
			this.lastFrameTime = new Date().getTime();
		}
		setImmediate( this.update.bind( this ) );
	}

	updateWormsList()
	{
		let tmp = [];
		this.players.forEach( ( element ) =>
		{
			let worms = element.getWorms();
			worms.forEach( ( element ) =>
			{
				tmp.push( element );
			} );
		} );
		let worms = [];
		tmp.forEach( ( element ) =>
		{
			worms.push( element.getWormState() );
		} );
		let tick = Buffer.alloc( 4 );
		tick.writeUInt32BE( this.frame, 0 );
		let count = Buffer.alloc( 4 );
		count.writeUInt32BE( worms.length, 0 );
		this.wormsList = {
			opcode : Buffer.from( [ 0x32 ] ),
			tick,
			count,
			worms
		};
	}

	getWorms()
	{
		return this.wormsList;
	}
}
module.exports = Game;
