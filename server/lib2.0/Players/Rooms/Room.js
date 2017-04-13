class Room {
	constructor()
	{
		this.isWaitingForPlayers = false;
	}

	isAvailable()
	{
		return this.isWaitingForPlayers;
	}
}

module.exporst = Room;
