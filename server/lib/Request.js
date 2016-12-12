const Instruction = require( './Instruction' );
const Parser = require( './Parser' );
const Response = require( './Response' );
class Request {
	constructor( client )
	{
		this.parser = new Parser( 'opcode:1' );
		this.client = client;
	}

	handleRequest( data )
	{
		if( data.length > 0 )
		{
			let instruction = Instruction.Map[ data[ 0 ] ];
			if( typeof instruction !== 'undefined' )
			{
				if( instruction.type === Instruction.Types.client || instruction.type === Instruction.Types.both )
				{
					if( typeof this.client[ instruction.callback ] === 'function' )
					{
						console.log( 'Received data: ' + data.toString( 'hex' ) );
						let parsedRequest = this.parser.decode( instruction.rule, data );
						this.client[ instruction.callback ]( parsedRequest );
						return true;
					}
					else
					{
						console.log( 'Callback not specified, lost data: ' + data.toString( 'hex' ) );
						return false;
					}
				}
				else
				{
					console.log( 'This instruction may be only sent by server: ' + data.toString( 'hex' ) );
					return false;
				}
			}
			else
			{
				console.log( 'Not recognized instruction: ' + data.toString( 'hex' ) );
				return false;
			}
		}
		else
		{
			console.log( 'Empty request' );
			return false;
		}
	}
}

module.exports = Request;
