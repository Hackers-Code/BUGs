'use strict';
class Room {
	constructor( settings, admin, id, roomsStorage )
	{
		this.nextClientId = 0;
		this.name = settings.name;
		this.password = settings.password;
		this.admin = admin;
		this.admin.assignRoom( this, this.nextClientId++, true );
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
