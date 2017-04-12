'use strict';
const Client = require( './Client' );
const UniqueKeyGenerator = require( '../Helpers/UniqueKeyGenerator' );
const UniqueNameStorage = require( '../Helpers/UniqueNameStorage' );
const SearchEngine = require( '../Helpers/SearchEngine' );
const DecodePacket = require( '../Protocol/PacketDecoder' );
const Sockets = require( '../Protocol/Types' ).Sockets;
class ClientsStorage {

	constructor()
	{
		this.clients = [];
		this.uniqueKeyGenerator = new UniqueKeyGenerator( 4 );
		this.uniqueNameStorage = new UniqueNameStorage( 20, 'Anonymous' );
	}

	getUniqueNameStorage()
	{
		return this.uniqueNameStorage;
	}

	getClientsCount()
	{
		return this.clients.length;
	}

	addClient( socketWrite, server )
	{
		let index = this.clients.push( new Client( socketWrite, server, this ) ) - 1;
		let id = this.uniqueKeyGenerator.generateKey();
		this.clients[ index ].setId( id );
		return this.clients[ index ].getCallbacks();
	}

	passUDPPacket( packet, rinfo, socketSend )
	{
		let result = SearchEngine.findByRinfo( rinfo, this.clients );
		if( result === -1 )
		{
			let decodedPacket = DecodePacket( packet );
			if( typeof decodedPacket.id !== 'undefined' )
			{
				return false;
			}
			let index = SearchEngine.findByUniqueID( decodedPacket.id, this.clients );
			if( index === -1 )
			{
				return false;
			}
			this.clients[ index ].assignUDPSocket( rinfo, socketSend );
		}
		else
		{
			this.clients[ result ].handleData( packet, Sockets.udp );
		}
		return true;
	}
}

module.exports = ClientsStorage;
