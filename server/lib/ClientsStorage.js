
class ClientsStorage {

	joinGame( params, client )
	{
		return this.roomsStorage.joinGame( params, client );
	}
}

module.exports = ClientsStorage;
