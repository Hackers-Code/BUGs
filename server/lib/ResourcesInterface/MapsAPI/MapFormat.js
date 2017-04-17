'use strict';
const MapFormat = {
	0x0 : {
		name : 'metadata',
		values : [
			{
				name : 'signature',
				length : 4
			},
			{
				name : 'version',
				length : 1
			},
			{
				name : 'compression',
				length : 1
			},
			{
				name : 'reserved',
				length : 2
			},
			{
				name : 'width',
				length : 4
			},
			{
				name : 'height',
				length : 4
			}
		]
	},
	0x1 : {
		name : 'spawns',
		values : [
			{
				name : 'x',
				length : 4
			},
			{
				name : 'y',
				length : 4
			}
		]
	},
	0x2 : {
		name : 'blocks',
		values : [
			{
				name : 'x',
				length : 4
			},
			{
				name : 'y',
				length : 4
			},
			{
				name : 'width',
				length : 4
			},
			{
				name : 'height',
				length : 4
			}
		]
	},
	0x3 : {
		name : 'killingZones',
		values : [
			{
				name : 'x',
				length : 4
			},
			{
				name : 'y',
				length : 4
			},
			{
				name : 'width',
				length : 4
			},
			{
				name : 'height',
				length : 4
			}
		]
	}
};
module.exports = MapFormat;
