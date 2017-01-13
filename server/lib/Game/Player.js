const Worm = require( './Worm' );
class Player {
	constructor( client, playerID )
	{
		client.player = this;
		this.response = client.response;
		this.id = client.id;
		this.playerID = playerID;
		this.confirmed = false;
		this.mapLoaded = false;
		this.name = client.name;
		this.worms = [];
		this.actualWorm = 0;
		this.colour = {
			R : Buffer.from( [ 0 ] ),
			G : Buffer.from( [ 0 ] ),
			B : Buffer.from( [ 0 ] )
		};
		this.mask = Buffer.from( [ 0 ] );
		this.udp = client.udp;
		this.isYourTurn = false;
		this.world = null;
	}

	addWorm( spawn, id, physics )
	{
		let worm = new Worm( spawn, this.playerID, id, physics );
		this.worms.push( worm );
	}

	chooseWorm()
	{
		let retval = this.actualWorm;
		this.actualWorm = this.actualWorm + 1 % this.worms.length;
		return retval;
	}

	setProperties( data )
	{
		this.colour.R = Buffer.from( [ data.colourR ] );
		this.colour.G = Buffer.from( [ data.colourG ] );
		this.colour.B = Buffer.from( [ data.colourB ] );
		this.mask = Buffer.from( [ data.mask ] );
		return true;
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
			if( worm.speedY < 0 )
			{
			}
			if( this.world.checkCollisionTop( worm.y, worm.x ) )
			{
				worm.speedY = 0;
			}
			if( !this.world.checkCollisionBottom( worm.y, worm.height, worm.x ) )
			{
				worm.speedY += worm.accelerationY * (diffTime / 1000);
				if( worm.speedY > worm.maxSpeedY )
				{
					worm.speedY = worm.maxSpeedY;
				}
				if( this.world.checkCollisionBottom( worm.y + worm.speedY * (diffTime / 1000), worm.height, worm.x ) )
				{
					worm.speedY = 0;
					continue;
				}
			}
			worm.y += worm.speedY * (
					diffTime / 1000
				);
		}
	}

	addWorld( world )
	{
		this.world = world;
	}
}

module.exports = Player;
