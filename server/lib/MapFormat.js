'use strict';

const Blocks = {
	metadata : [
		{
			name : 'width',
			length : 4
		},
		{
			name : 'height',
			length : 4
		},
	],
	data : [
		{
			name : 'spawn',
			length : 9,
			opcode : 0x1,
			rule : 'x:4;y:4'
		},
		{
			name : 'block',
			length : 17,
			opcode : 0x2,
			rule : 'x:4;y:4;width:4;height:4'
		},
		{
			name : 'killing_zone',
			length : 17,
			opcode : 0x3,
			rule : 'x:4;y:4;width:4;height:4'
		}
	]
};
module.exports = Blocks;
