class RoomsStorage {
	joinGame( params, client )
	{
		if( typeof params.roomID !== 'undefined' && typeof params.password !== 'undefined' )
		{
			let room = this.findRoomById( params.roomID );
			if( room !== false && room !== -1 )
			{
				if( this.rooms[ room ].joinGame( params.password, client ) )
				{
					return this.rooms[ room ];
				}
				return false;
			}
			else
			{
				return false;
			}
		}
		return false;
	}
}

module.exports = RoomsStorage;
