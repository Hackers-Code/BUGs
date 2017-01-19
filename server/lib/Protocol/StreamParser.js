'use strict';
class StreamParser {
	constructor()
	{
		this.buffer = Buffer.alloc( 0 );
	}

	appendData( data )
	{
		if( data instanceof Buffer )
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

	freeBufferToOffset( offset )
	{
		this.buffer = this.buffer.slice( offset );
		return this.buffer.length;
	}
}
module.exports = StreamParser;
