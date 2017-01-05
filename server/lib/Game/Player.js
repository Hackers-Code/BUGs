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
		this.colour = [];
		this.mask = 0;
		this.ip = client.socket.remoteAddress;
		this.port = 0;
		this.isYourTurn = false;
	}

	addWorm( spawn, id )
	{
		let worm = new Worm( spawn, this.playerID, id );
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
		this.colour = [];
		this.colour.push( data.colourR );
		this.colour.push( data.colourG );
		this.colour.push( data.colourB );
		this.mask = data.mask;
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

	setUDP( port )
	{
		this.port = port.readUInt16BE( 0 );
	}

	getWorms()
	{
		return this.worms;
	}
}

module.exports = Player;
