class Player {
	constructor( client )
	{
		client.player = this;
		this.response = client.response;
		this.id = client.id;
		this.confirmed = false;
		this.mapLoaded = false;
		this.name = client.name;
		this.worms = [];
		this.colour = [];
		this.mask = 0;
		this.port = 0;
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
		this.port = port;
	}
}

module.exports = Player;
