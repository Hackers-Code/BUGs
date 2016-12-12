const Client = require( './Client' );

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
		rule : 'id:4;nick:20',
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
		rule : 'id:4;roomName:20;passwordLength:1;password:passwordLength',
		callback : 'createRoom',
		type : InstructionTypes.client
	},
	0x8 : {
		rule : 'status:1',
		type : InstructionTypes.server
	},
	0x9 : {
		rule : 'playerID:4;mapID:4;maxPlayers:1',
		callback : 'setRoomSettings',
		type : InstructionTypes.client
	},
	0xa : {
		rule : 'status:1',
		type : InstructionTypes.server
	},
	0x10 : {
		rule : 'playerID:4;roomID:4;passwordLength:1;password:passwordLength',
		callback : 'joinGame',
		type : InstructionTypes.client
	},
	0x11 : {
		rule : 'status:1;mapID:4&status=1',
		type : InstructionTypes.server
	},
	0x12 : {
		rule : 'id:4',
		callback : 'confirmGame',
		type : InstructionTypes.client
	},
	0x13 : {
		rule : 'status:1',
		type : InstructionTypes.server
	},
	0x14 : {
		rule : '',
		type : InstructionTypes.server
	},
	0x15 : {
		rule : 'id:4',
		callback : 'getPlayers',
		type : InstructionTypes.client
	},
	0x16 : {
		rule : 'players_count:1;players(id:1,name:20)*players_count',
		type : InstructionTypes.server
	},
	0x17 : {
		rule : 'id:4',
		callback : 'getWorms',
		type : InstructionTypes.client
	},
	0x18 : {
		rule : 'worms_count:1;worms(owner_id:1,x:4,y:4,hp:1,worm_id:1)*worms_count',
		type : InstructionTypes.server
	},
	0x19 : {
		rule : 'id:4',
		callback : null,
		type : InstructionTypes.client
	},
	0x1a : {
		rule : 'worms_count:1;worms(owner_id:1,x:4,y:4,hp:1,worm_id:1)*worms_count',
		callback : null,
		type : InstructionTypes.server
	},
	0x1b : {
		rule : '',
		callback : null,
		type : InstructionTypes.server
	},
	0x1c : {
		rule : 'id:4',
		callback : null,
		type : InstructionTypes.client
	},
	0x1d : {
		rule : 'seconds:1',
		callback : null,
		type : InstructionTypes.server
	},
	0x1e : {
		rule : '',
		callback : null,
		type : InstructionTypes.server
	},
	0xe0 : {
		rule : '',
		callback : null,
		type : InstructionTypes.server
	},
	0xe1 : {
		rule : '',
		callback : null,
		type : InstructionTypes.server
	},
	0xe2 : {
		rule : '',
		callback : null,
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
