class Player {
	constructor( client )
	{
		this.response = client.response;
		this.id = client.id;
		this.confirmed = false;
		this.mapLoaded = false;
		this.name = client.name;
		this.worms = [];
		this.colour = [];
		this.mask = 0;
	}

	setProperties( data )
	{
		this.colour = [];
		this.colour.push( data.colourR );
		this.colour.push( data.colourG );
		this.colour.push( data.colourB );
		this.mask = data.mask;
	}

	confirm()
	{
		this.confirmed = true;
	}
}

module.exports = Player;
