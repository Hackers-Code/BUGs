'use strict';
const Instruction = require( './Protocol/Instruction' );
const Parser = require( './Protocol/Parser' );
class Request {
	constructor( client, response )
	{
		this.parser = new Parser( 'opcode:1' );
		this.response = response;
		this.client = client;
	}

	handleRequest( data )
	{
		if( data.length > 0 )
		{
			let instruction = Instruction.Map[ data[ 0 ] ];
			if( typeof instruction !== 'undefined' )
			{
				if( instruction.type === Instruction.Types.client )
				{
					if( typeof this.client[ instruction.callback ] === 'function' )
					{
						let parsedRequest = this.parser.decode( instruction.rule, data );
						let response = this.client[ instruction.callback ]( parsedRequest );
						if( typeof instruction.response !== 'undefined' )
						{
							if( typeof response === 'boolean' )
							{
								this.response.send( {
									opcode : instruction.response,
									status : Buffer.from( [ response ? 1 : 0 ] )
								} );
							}
							if( typeof response === 'object' )
							{
								this.response.send( {
									opcode : instruction.response,
									count : response.count,
									array : response.array
								} );
							}
						}
						return true;
					}
					else
					{
						this.client.response.send( { opcode : 0xe2 } );
						return false;
					}
				}
				else
				{
					this.client.response.send( { opcode : 0xe3 } );
					return false;
				}
			}
			else
			{
				this.client.response.send( { opcode : 0xe0 } );
				return false;
			}
		}
		else
		{
			this.client.response.send( { opcode : 0xe1 } );
			return false;
		}
	}
}

module.exports = Request;
