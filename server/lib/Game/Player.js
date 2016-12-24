class Player {
	constructor( client )
	{
		this.response = client.response;
		this.id = client.id;
		this.confirmed = false;
		this.mapLoaded = false;
		this.name = client.name;
		this.worms = [];
	}
}

module.exports = Player;
