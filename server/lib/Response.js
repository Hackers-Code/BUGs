class Response {
	formatResponse( opcode, params )
	{
		let response = Buffer.from( [ opcode ] );
		if( params instanceof Buffer )
		{
			response = Buffer.concat( [
				response,
				params
			] );
		}
		else if( typeof params === 'number' )
		{
			response = Buffer.concat( [
				response,
				Buffer.from( [ params ] )
			] );
		}
		return response;
	}

	sendOld( socket, opcode, params )
	{
		let response = this.formatResponse( opcode, params );
		console.log( 'Sending to socket with id: ' + socket.id );
		console.log( response );
		socket.write( response );
	}
}
module.exports = Response;