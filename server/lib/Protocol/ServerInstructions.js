module.exports = {
	0x00 : {
		params : {
			length : 1,
			error : "length"
		}

	},
	0x02 : {
		params : { status : 1 }

	},
	0x04 : {
		params : {
			length : 1,
			reason : "length"
		}

	},
	0x05 : {
		params : { id : 4 }

	},
	0x07 : {
		params : {}
	},
	0x11 : {
		params : {
			count : 4,
			games : {
				id : 4,
				name : 20,
			}
		}
	},
	0x21 : {
		params : { status : 1 }

	},
	0x23 : {
		params : { status : 1 }

	},
	0x25 : {
		params : { status : 1 }

	},
	0x27 : {
		params : {
			status : 1,
			player_id : 1
		}

	},
	0x29 : {
		params : {
			map : 4,
			gravity : 2,
			jumpHeight : 2,
			maxSpeedX : 2,
			maxSpeedY : 2,
			maxPlayers : 1
		}
	},
	0x2b : {
		params : { status : 1 }

	},
	0x2d : {
		params : { status : 1 }

	},
	0x2f : {
		params : {
			ready : 1,
			count : 4,
			players : {
				playerID : 1,
				name : 20,
				colourR : 1,
				colourG : 1,
				colourB : 1,
				mask : 1
			}

		}
	},
	0x30 : {
		params : {}
	},
	0x32 : {
		params : {
			tick : 4,
			count : 4,
			worms : {
				owner : 1,
				x : 4,
				y : 4,
				hp : 1,
				id : 1,
				speedX : 2,
				speedY : 2
			}

		}

	},
	0x33 : {
		params : {
			worm_id : 1,
			player_id : 1
		}

	},
	0x35 : {
		params : {
			tick : 4,
			seconds : 1
		}
	},
	0x36 : {
		params : {}
	},
	0xe0 : {
		params : {
			length : 1,
			error : "length"
		}
	},
	0xe1 : {
		params : {
			length : 1,
			error : "length"
		}
	},
	0xe2 : {
		params : {
			length : 1,
			error : "length"
		}
	}
};
