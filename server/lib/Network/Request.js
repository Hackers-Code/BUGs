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
		console.log( data );
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
								let object = response;
								object.opcode = instruction.response;
								this.response.send( object );
							}
						}
						return true;
					}
					else
					{
						let error = 'Server error';
						this.client.response.send( {
							opcode : 0xe2,
							length : Buffer.from( [ error.length ] ),
							error : Buffer.from( error )
						} );
						return false;
					}
				}
				else
				{
					let error = 'This instruction cannot be used by client';
					this.client.response.send( {
						opcode : 0xe3,
						length : Buffer.from( [ error.length ] ),
						error : Buffer.from( error )
					} );
					return false;
				}
			}
			else
			{
				let error = `Unknown instruction (${parseInt( data[ 0 ], 16 )})`;
				this.client.response.send( {
					opcode : 0xe0,
					length : Buffer.from( [ error.length ] ),
					error : Buffer.from( error )
				} );
				return false;
			}
		}
		else
		{
			let error = 'Packet too short';
			this.client.response.send( {
				opcode : 0xe1,
				length : Buffer.from( [ error.length ] ),
				error : Buffer.from( error )
			} );
			return false;
		}
	}
}

module.exports = Request;
