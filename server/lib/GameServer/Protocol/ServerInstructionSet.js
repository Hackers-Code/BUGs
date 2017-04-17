'use strict';
const Sockets = require( './Types' ).Sockets;
const DataTypes = require( './Types' ).DataTypes;
const tcp = Sockets.tcp;
const udp = Sockets.udp;
const BinaryString = DataTypes.buffer;
const ShortString = DataTypes.shortString;
const Array = DataTypes.array;
const U8 = DataTypes.u8;
const U16BE = DataTypes.u16be;
const U32BE = DataTypes.u32be;
const I8 = DataTypes.i8;
const I16BE = DataTypes.i16be;
const Bool = DataTypes.bool;
module.exports = {
	0x00 : {
		socket : tcp,
		params : {
			error : ShortString
		}
	},
	0x02 : {
		socket : tcp,
		params : { status : Bool }

	},
	0x04 : {
		socket : tcp,
		params : {
			reason : ShortString
		}
	},
	0x05 : {
		socket : tcp,
		params : { id : BinaryString( 4 ) }
	},
	0x07 : {
		socket : udp,
		params : {}
	},
	0x08 : {
		socket : udp,
		params : {}
	},
	0x11 : {
		socket : tcp,
		params : {
			games : Array( {
				id : BinaryString( 4 ),
				name : BinaryString( 20 )
			} )
		}
	},
	0x21 : {
		socket : tcp,
		params : { status : Bool }

	},
	0x23 : {
		socket : tcp,
		params : { status : Bool }

	},
	0x25 : {
		socket : tcp,
		params : { status : Bool }

	},
	0x27 : {
		socket : tcp,
		params : {
			status : Bool,
			player_id : U8
		}

	},
	0x29 : {
		socket : tcp,
		params : {
			map : U32BE,
			gravity : U16BE,
			jumpHeight : I16BE,
			maxSpeedY : U16BE,
			maxSpeedX : U16BE,
			maxPlayers : U8
		}
	},
	0x2b : {
		socket : tcp,
		params : { status : Bool }
	},
	0x2d : {
		socket : tcp,
		params : { status : Bool }
	},
	0x2f : {
		socket : tcp,
		params : {
			readyPlayers : U8,
			players : Array( {
				lobbyID : U8,
				name : BinaryString( 20 ),
				colorR : U8,
				colorG : U8,
				colorB : U8,
				mask : U8
			} )
		}
	},
	0x30 : {
		socket : tcp,
		params : {}
	},
	0x32 : {
		socket : udp,
		params : {
			tick : U32BE,
			worms : Array( {
				owner : U8,
				angle : U8,
				x : U32BE,
				y : U32BE,
				hp : U8,
				id : U8,
				speedX : I16BE,
				speedY : I16BE
			} )
		}
	},
	0x33 : {
		socket : tcp,
		params : {
			worm_id : U8,
			player_id : U8
		}
	},
	0x35 : {
		socket : udp,
		params : {
			tick : U32BE,
			seconds : U8
		}
	},
	0x36 : {
		socket : tcp,
		params : {}
	},
	0x3a : {
		socket : tcp,
		params : {
			players : Array( {
				id : U8
			} )
		}
	},
	0x41 : {
		socket : udp,
		params : {
			weapons : Array( {
				id : U8,
				usages : I8
			} )
		}
	},
	0x44 : {
		socket : udp,
		params : { id : U8 }
	},
	0x45 : {
		socket : udp,
		params : { param : U8 }
	},
	0xe0 : {
		params : {
			error : ShortString
		}
	},
	0xe1 : {
		params : {
			error : ShortString
		}
	},
	0xe2 : {
		params : {
			error : ShortString
		}
	}
};
