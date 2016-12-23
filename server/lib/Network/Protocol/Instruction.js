'use strict';
const InstructionTypes = {
	server : 1,
	client : 2
};

const InstructionMap = {
	0x00 : {
		rule : '',
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
		rule : 'reason:30',
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
};
module.exports.Map = InstructionMap;
module.exports.Types = InstructionTypes;
