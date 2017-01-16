/*'use strict';
 const Clients = require( '../lib/Clients/Clients' );
 const chai = require( 'chai' );
 const expect = chai.expect;
 const ClientsStorage = require( '../lib/Clients/ClientsStorage' );
 describe( 'Clients storage', () =>
 {
 let clientsStorage;
 beforeEach( () =>
 {
 clientsStorage = new ClientsStorage( 4 );
 } );
 it( 'getTasks() should return empty array if task was added and then removed', () =>
 {
 let id = tasksStorage.addTask( () => {}, 1000 );
 tasksStorage.removeTask( id );
 expect( tasksStorage.getTasks() ).to.be.an( 'array' ).with.length( 0 );
 } );
 } );
 describe( 'Client', () =>
 {
 let client;
 beforeEach( () =>
 {
 client = new Client( 4 );
 } );
 it( 'getTasks() should return empty array if task was added and then removed', () =>
 {
 let id = tasksStorage.addTask( () => {}, 1000 );
 tasksStorage.removeTask( id );
 expect( tasksStorage.getTasks() ).to.be.an( 'array' ).with.length( 0 );
 } );
 } );
 */
