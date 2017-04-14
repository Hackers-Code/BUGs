'use strict';
const Sockets = require( './Types' ).Sockets;
const DataTypes = require( './Types' ).DataTypes;

const tcp = Sockets.tcp;
const udp = Sockets.udp;

const BinaryString = DataTypes.buffer;
const ShortString = DataTypes.shortString;
const U8 = DataTypes.u8;
const U16BE = DataTypes.u16be;
const U32BE = DataTypes.u32be;
const I8 = DataTypes.i8;
const I16BE = DataTypes.i16be;
module.exports = {
	0x01 : {
		socket : tcp,
		event : 'changeName',
		response : 0x02,
		params : { name : BinaryString( 20 ) }
	},
	0x03 : {
		socket : tcp,
		params : {},
		event : 'leaveRoom'
	},
	0x06 : {
		socket : udp,
		params : { id : BinaryString( 4 ) },
		response : 0x07
	},
	0x10 : {
		socket : tcp,
		params : {},
		event : 'listGames',
		response : 0x11
	},
	0x20 : {
		socket : tcp,
		params : {
			name : BinaryString( 20 ),
			password : ShortString
		},
		event : 'createRoom',
		response : 0x21
	},
	0x22 : {
		socket : tcp,
		params : {
			gravity : U16BE,
			jumpHeight : I16BE,
			maxSpeedY : U16BE,
			maxSpeedX : U16BE
		},
		event : 'setGamePhysics',
		response : 0x23
	},
	0x24 : {
		socket : tcp,
		params : {
			map : U32BE,
			players : U8
		},
		event : 'setRoomConfig',
		response : 0x25
	},
	0x26 : {
		socket : tcp,
		params : {
			room : U32BE,
			password : ShortString
		},
		event : 'joinRoom',
		response : 0x27
	},
	0x28 : {
		socket : tcp,
		params : {},
		event : 'getRoomConfig',
		response : 0x29
	},
	0x2a : {
		socket : tcp,
		params : {
			colourR : U8,
			colourG : U8,
			colourB : U8,
			mask : U8
		},
		event : 'setPlayerProperties',
		response : 0x2b
	},
	0x2c : {
		socket : tcp,
		params : {},
		event : 'switchReady',
		response : 0x2d
	},
	0x2e : {
		socket : tcp,
		params : {},
		event : 'listPlayers',
		response : 0x2f
	},
	0x31 : {
		socket : tcp,
		params : {},
		event : 'mapLoaded'
	},
	0x37 : {
		socket : udp,
		params : {},
		event : 'jump'
	},
	0x38 : {
		socket : udp,
		params : {},
		event : 'switchMoveLeft'
	},
	0x39 : {
		socket : udp,
		params : {},
		event : 'switchMoveRight'
	},
	0x3b : {
		socket : udp,
		params : {
			angle : I8
		},
		event : 'setAngle'
	},
	0x40 : {
		socket : udp,
		params : {},
		response : 0x41,
		event : 'getWeaponsList'
	},
	0x42 : {
		socket : udp,
		params : { id : U8 },
		event : 'selectWeapon'
	},
	0x43 : {
		socket : udp,
		params : { param : U8 },
		event : 'useWeapon'
	}
};
