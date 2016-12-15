'use strict';
const InstructionTypes = {
	both : 0,
	server : 1,
	client : 2
};

const InstructionMap = {
	0x0 : {
		rule : '',
		callback : 'disconnect',
		type : InstructionTypes.both
	},
	0x1 : {
		rule : '',
		callback : 'setID',
		type : InstructionTypes.client
	},
	0x2 : {
		rule : 'id:4',
		type : InstructionTypes.server
	},
	0x3 : {
		rule : 'nick:20',
		callback : 'setName',
		type : InstructionTypes.client
	},
	0x4 : {
		rule : 'status:1',
		type : InstructionTypes.server
	},
	0x5 : {
		rule : '',
		callback : 'listGames',
		type : InstructionTypes.client
	},
	0x6 : {
		rule : 'count:4;games(id:4,name:20)*count',
		type : InstructionTypes.server
	},
	0x7 : {
		rule : 'roomName:20;passwordLength:1;password:passwordLength',
		callback : 'createRoom',
		type : InstructionTypes.client
	},
	0x8 : {
		rule : 'status:1',
		type : InstructionTypes.server
	},
	0x9 : {
		rule : 'mapID:4;maxPlayers:1',
		callback : 'setRoomSettings',
		type : InstructionTypes.client
	},
	0xa : {
		rule : 'status:1',
		type : InstructionTypes.server
	},
	0x10 : {
		rule : 'roomID:4;passwordLength:1;password:passwordLength',
		callback : 'joinGame',
		type : InstructionTypes.client
	},
	0x11 : {
		rule : 'status:1;mapID:4&status=1',
		type : InstructionTypes.server
	},
	0x12 : {
		rule : '',
		callback : 'confirmGame',
		type : InstructionTypes.client
	},
	0x13 : {
		rule : '',
		type : InstructionTypes.server
	},
	0x14 : {
		rule : '',
		type : InstructionTypes.server
	},
	0x15 : {
		rule : '',
		callback : 'getPlayers',
		type : InstructionTypes.client
	},
	0x16 : {
		rule : 'players_count:1;players(id:1,name:20)*players_count',
		type : InstructionTypes.server
	},
	0x17 : {
		rule : '',
		callback : 'getWorms',
		type : InstructionTypes.client
	},
	0x18 : {
		rule : 'worms_count:1;worms(owner_id:1,x:4,y:4,hp:1,worm_id:1)*worms_count',
		type : InstructionTypes.server
	},
	0x19 : {
		rule : 'worm_id:1',
		type : InstructionTypes.server
	},
	0x1a : {
		rule : '',
		callback : 'getTimeLeft',
		type : InstructionTypes.client
	},
	0x1b : {
		rule : 'seconds:1',
		type : InstructionTypes.server
	},
	0x1c : {
		rule : '',
		type : InstructionTypes.server
	},
	0xe0 : {
		rule : '',
		type : InstructionTypes.server
	},
	0xe1 : {
		rule : '',
		type : InstructionTypes.server
	},
	0xe2 : {
		rule : '',
		type : InstructionTypes.server
	},
	0xe3 : {
		rule : '',
		type : InstructionTypes.server
	},
	0xfe : {
		rule : 'id:4',
		callback : null,
		type : InstructionTypes.client
	},
	0xff : {
		rule : 'status:1',
		callback : null,
		type : InstructionTypes.server
	}
};
module.exports.Map = InstructionMap;
module.exports.Types = InstructionTypes;
