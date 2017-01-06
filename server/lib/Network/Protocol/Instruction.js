'use strict';
const InstructionTypes = {
	server : 1,
	client : 2
};

const InstructionMap = {
	0x00 : {
		rule : 'length:1;error:length',
		type : InstructionTypes.server
	},
	0x01 : {
		rule : 'nick:20',
		callback : 'setName',
		response : 0x02,
		type : InstructionTypes.client
	},
	0x02 : {
		rule : 'status:1',
		type : InstructionTypes.server
	},
	0x03 : {
		rule : '',
		callback : 'leaveRoom',
		type : InstructionTypes.client
	},
	0x04 : {
		rule : 'length:1;reason:length',
		type : InstructionTypes.server
	},
	0x05 : {
		rule : 'id:4',
		type : InstructionTypes.server
	},
	0x10 : {
		rule : '',
		callback : 'listGames',
		response : 0x11,
		type : InstructionTypes.client
	},
	0x11 : {
		rule : 'count:4;array(id:4,name:20)*count',
		type : InstructionTypes.server
	},
	0x20 : {
		rule : 'name:20;passwordLength:1;password:passwordLength',
		type : InstructionTypes.client,
		callback : 'createRoom',
		response : 0x21
	},
	0x21 : {
		rule : 'status:1',
		type : InstructionTypes.server
	},
	0x22 : {
		rule : 'gravity:2;jumpHeight:2;maxSpeedX:2;maxSpeedY:2',
		type : InstructionTypes.client,
		callback : 'setGamePhysics',
		response : 0x23
	},
	0x23 : {
		rule : 'status:1',
		type : InstructionTypes.server
	},
	0x24 : {
		rule : 'map:4;players:1',
		type : InstructionTypes.client,
		callback : 'setRoomConfig',
		response : 0x25
	},
	0x25 : {
		rule : 'status:1',
		type : InstructionTypes.server
	},
	0x26 : {
		rule : 'room:4;length:1;password:length',
		type : InstructionTypes.client,
		callback : 'joinRoom',
		response : 0x27
	},
	0x27 : {
		rule : 'status:1',
		type : InstructionTypes.server
	},
	0x28 : {
		rule : '',
		type : InstructionTypes.client,
		callback : 'getRoomConfig',
		response : 0x29
	},
	0x29 : {
		rule : 'map:4;gravity:2;jumpHeight:2;maxSpeedX:2;maxSpeedY:2;maxPlayers:1',
		type : InstructionTypes.server
	},
	0x2a : {
		rule : 'colourR:1;colourG:1;colourB:1;mask:1',
		type : InstructionTypes.client,
		callback : 'setPlayerProperties',
		response : 0x2b
	},
	0x2b : {
		rule : 'status:1',
		type : InstructionTypes.server
	},
	0x2c : {
		rule : '',
		type : InstructionTypes.client,
		callback : 'switchReady',
		response : 0x2d
	},
	0x2d : {
		rule : 'status:1',
		type : InstructionTypes.server
	},
	0x2e : {
		rule : '',
		type : InstructionTypes.client,
		callback : 'listPlayers',
		response : 0x2f
	},
	0x2f : {
		rule : 'ready:1;count:4;players(index:1,name:20)*count',
		type : InstructionTypes.server
	},
	0x30 : {
		rule : '',
		type : InstructionTypes.server
	},
	0x31 : {
		rule : 'port:2',
		type : InstructionTypes.client,
		callback : 'setUDP'
	},
	0x32 : {
		rule : 'tick:4;count:4;worms(owner:1,x:4,y:4,hp:1,id:1,speedX:2,speedY:2)*count',
		type : InstructionTypes.server,
	},
	0x33 : {
		rule : 'worm_id:1',
		type : InstructionTypes.server
	},
	0x36 : {
		rule : '',
		type : InstructionTypes.server
	},
	0xe0 : {
		rule : 'length:1;error:length',
		type : InstructionTypes.server
	},
	0xe1 : {
		rule : 'length:1;error:length',
		type : InstructionTypes.server
	},
	0xe2 : {
		rule : 'length:1;error:length',
		type : InstructionTypes.server
	},
	0xe3 : {
		rule : 'length:1;error:length',
		type : InstructionTypes.server
	}
};
module.exports.Map = InstructionMap;
module.exports.Types = InstructionTypes;
