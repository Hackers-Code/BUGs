'use strict';
class Room {
	constructor( settings, admin, id, roomsStorage )
	{
		this.name = settings.name;
		this.password = settings.password;
		this.admin = admin;
		this.id = id;
		this.roomsStorage = roomsStorage;
		this.isWaitingForPlayers = false;
	}

	isAvailable()
	{
		return this.isWaitingForPlayers;
	}
}

module.exports = Room;
