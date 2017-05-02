'use strict';
const Collection = require( '../../Collections/' ).UniqueKeyCollection;
const Client = require( './Client' );
const UniqueKeyGenerator = require( '../../Helpers/UniqueKeyGenerator' );
const DecodePacket = require( '../Protocol/PacketDecoder' );
const Sockets = require( '../Protocol/Types' ).Sockets;
class ClientsStorage extends Collection {
	constructor()
	{
		super( 'clients', 'id' );
		this.clients = [];
		this.uniqueKeyGenerator = new UniqueKeyGenerator( 4 );
	}

	findByRinfo( rinfo )
	{
		for( let i = 0 ; i < this.clients.length ; i++ )
		{
			let clientRinfo = this.clients[ i ].getRinfo();
			if( clientRinfo === null )
			{
				continue;
			}
			if( rinfo.port === clientRinfo.port && rinfo.address === clientRinfo.address )
			{
				return i;
			}
		}
		return -1;
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
		return this.clients[ index ];
	}

	removeClient( id )
	{
		let client = this.find( id );
		if( client !== -1 )
		{
			this.uniqueKeyGenerator.freeKey( this.clients[ client ].id );
			this.clients.splice( client, 1 );
			return true;
		}
		return false;
	}

	passUDPPacket( packet, rinfo, socketSend )
	{
		let result = this.findByRinfo( rinfo );
		if( result === -1 )
		{
			let decodedPacket = DecodePacket( packet, Sockets.udp );
			if( decodedPacket.success === true || typeof decodedPacket.result.object.id !== 'undefined' )
			{
				let index = this.find( decodedPacket.result.object.id );
				if( index !== -1 )
				{
					this.clients[ index ].assignUDPSocket( rinfo, socketSend );
				}
			}
		}
		else
		{
			this.clients[ result ].handleData( packet, Sockets.udp );
		}
	}
}

module.exports = ClientsStorage;
