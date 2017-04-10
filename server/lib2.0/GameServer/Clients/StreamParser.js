'use strict';
class StreamParser {
	constructor()
	{
		this.buffer = Buffer.alloc( 0 );
	}

	appendData( data )
	{
		if( Buffer.isBuffer( data ) )
		{
			this.buffer = Buffer.concat( [
				this.buffer,
				data
			] );
			return true;
		}
		return false;
	}

	getBuffer()
	{
		return this.buffer;
	}

	clearBuffer()
	{
		this.buffer = new Buffer.alloc( 0 );
	}

	freeBufferToOffset( offset )
	{
		this.buffer = this.buffer.slice( offset );
		return this.buffer.length;
	}
}
module.exports = StreamParser;
