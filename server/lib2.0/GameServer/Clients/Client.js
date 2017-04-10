'use strict';
class Client {
	constructor( socketWrite )
	{
		this.tcpSocketWrite = socketWrite;
	}
}

module.exports = Client;
