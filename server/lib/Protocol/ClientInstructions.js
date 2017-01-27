'use strict';
module.exports = {
	0x01 : {
		callback : 'setName',
		response : 0x02,
		params : { name : 20 }
	},
	0x03 : {
		params : {},
		callback : 'leaveRoom'
	},
	0x06 : {
		params : { id : 4 },
		callback : 'setUDP',
		response : 0x07
	},
	0x10 : {
		params : {},
		callback : 'listGames',
		response : 0x11
	},
	0x20 : {
		params : {
			name : 20,
			length : 1,
			password : "length"
		},
		callback : 'createRoom',
		response : 0x21
	},
	0x22 : {
		params : {
			gravity : 2,
			jumpHeight : 2,
			maxSpeedY : 2,
			maxSpeedX : 2
		},
		callback : 'setGamePhysics',
		response : 0x23
	},
	0x24 : {
		params : {
			map : 4,
			players : 1
		},
		callback : 'setRoomConfig',
		response : 0x25
	},
	0x26 : {
		params : {
			room : 4,
			length : 1,
			password : "length"
		},
		callback : 'joinRoom',
		response : 0x27
	},
	0x28 : {
		params : {},
		callback : 'getRoomConfig',
		response : 0x29
	},
	0x2a : {
		params : {
			colourR : 1,
			colourG : 1,
			colourB : 1,
			mask : 1
		},
		callback : 'setPlayerProperties',
		response : 0x2b
	},
	0x2c : {
		params : {},
		callback : 'switchReady',
		response : 0x2d
	},
	0x2e : {
		params : {},
		callback : 'listPlayers',
		response : 0x2f
	},
	0x31 : {
		params : {},
		callback : 'mapLoaded'
	},
	0x37 : {
		params : {},
		callback : 'jump'
	},
	0x38 : {
		params : {},
		callback : 'switchMoveLeft'
	},
	0x39 : {
		params : {},
		callback : 'switchMoveRight'
	}
};
