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
		rule : 'map:4;length:1;password:length',
		type : InstructionTypes.client,
		callback : 'joinRoom',
		response : 0x27
	},
	0x27 : {
		rule : 'status:1',
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
