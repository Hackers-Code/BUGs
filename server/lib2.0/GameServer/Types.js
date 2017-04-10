const Attributes = {
	boolean : -1,
	signed : 0,
	unsigned : 1
};
const boolean = Attributes.boolean;
const signed = Attributes.signed;
const unsigned = Attributes.unsigned;

const Encoding = {
	be : 1,
	le : 2
};
const be = Encoding.be;

const DataTypes = {
	string20 : {
		length : 20
	},
	shortString : {
		metadata : {
			length : 1
		}
	},
	array : ( item ) =>
	{
		return {
			metadata : {
				size : 4
			},
			item
		};
	},
	u8 : {
		length : 1,
		type : unsigned
	},
	u16be : {
		length : 2,
		type : unsigned,
		encoding : be
	},
	u32be : {
		length : 4,
		type : unsigned,
		encoding : be
	},
	i8 : {
		length : 1,
		type : signed
	},
	i16be : {
		length : 2,
		type : signed,
		encoding : be
	},
	bool : {
		length : 1,
		type : boolean
	}
};

const Sockets = {
	tcp : 1,
	udp : 2
};

module.exports.Sockets = Sockets;
module.exports.Encoding = Encoding;
module.exports.Attributes = Attributes;
module.exports.DataTypes = DataTypes;
