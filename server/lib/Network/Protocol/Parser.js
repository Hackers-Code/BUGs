'use strict';

class Parser {
	constructor( defRule )
	{
		this.defaultRule = defRule;
	}

	encode( ruleString, object )
	{
		let rules = this.createRule( ruleString );
		if( rules === false )
		{
			console.log( 'rules' );
			return false;
		}
		let offset = 0;
		let buffer = Buffer.from( [] );
		for( let i = 0 ; i < rules.length ; i++ )
		{
			let rule = rules[ i ];
			if( rule.type === 'normal' )
			{
				if( isNaN( parseInt( rule.length ) ) )
				{
					rule.length = object[ rule.length ].readInt8( 0 );
				}
				if( object[ rule.name ] instanceof Buffer )
				{
					buffer = Buffer.concat( [
						buffer, object[ rule.name ]
					] );
				}
				else
				{
					console.log( 'normal' );
					return false;
				}
			}
			else if( rule.type === 'array' )
			{
				for( let i = 0 ; i < object[ rule.multiplier ].readInt32BE( 0 ) ; i++ )
				{
					for( let j = 0 ; j < rule.properties.length ; j++ )
					{
						if( object[ rule.arrayName ][ i ][ rule.properties[ j ].name ] instanceof Buffer )
						{

							buffer = Buffer.concat( [
								buffer, object[ rule.arrayName ][ i ][ rule.properties[ j ].name ]
							] );
						}
						else
						{
							console.log( 'array' );
							return false;
						}
					}
				}
			}
			else
			{
				return false;
			}
			if( offset > buffer.length )
			{
				return false;
			}
		}
		return buffer;
	}

	decode( ruleString, buffer )
	{
		let rules = this.createRule( ruleString );
		if( rules === false )
		{
			return false;
		}
		let offset = 0;
		let object = {};
		for( let i = 0 ; i < rules.length ; i++ )
		{
			let rule = rules[ i ];
			if( rule.type === 'normal' )
			{
				if( isNaN( parseInt( rule.length ) ) )
				{
					rule.length = object[ rule.length ].readInt8( 0 );
				}
				object[ rule.name ] = buffer.slice( offset, offset += parseInt( rule.length ) );
			}
			else if( rule.type === 'array' )
			{
				let games = [];
				for( let i = 0 ; i < object[ rule.multiplier ].readInt32BE( 0 ) ; i++ )
				{
					let tmp = {};
					for( let j = 0 ; j < rule.properties.length ; j++ )
					{
						tmp[ rule.properties[ j ].name ] = buffer.slice( offset,
							offset += parseInt( rule.properties[ j ].length ) );
					}
					games.push( tmp );
				}
				object[ rule.arrayName ] = games;
			}
			else
			{
				return false;
			}
			if( offset > buffer.length )
			{
				return false;
			}
		}
		return object;
	}

	concatRule( rule )
	{
		if( this.defaultRule.length === 0 )
		{
			return rule;
		}
		if( rule.length === 0 )
		{
			return this.defaultRule;
		}
		return this.defaultRule + ';' + rule;
	}

	createRule( ruleString )
	{
		let rule = [];
		ruleString = this.concatRule( ruleString );
		ruleString = ruleString.split( ';' );
		let normalRuleRegexp = /^\w+:\w+$/;
		let arrayRuleRegexp = /^\w+\((?:\w|,|:)+\)\*\w+$/;
		for( let i = 0 ; i < ruleString.length ; i++ )
		{
			if( ruleString[ i ].match( normalRuleRegexp ) )
			{
				let tmp = ruleString[ i ].split( ':' );
				rule.push( {
					type : 'normal', name : tmp[ 0 ], length : tmp[ 1 ]
				} );
			}
			else if( ruleString[ i ].match( arrayRuleRegexp ) )
			{
				let tmp = ruleString[ i ].match( /^(\w+)\(((?:\w|,|:)+)\)\*(\w+)$/ );
				let data = tmp[ 2 ].split( ',' );
				let properties = [];
				for( let i = 0 ; i < data.length ; i++ )
				{
					properties.push( {
						name : data[ i ].split( ':' )[ 0 ], length : data[ i ].split( ':' )[ 1 ]
					} )
				}
				rule.push( {
					type : 'array', arrayName : tmp[ 1 ], properties : properties, multiplier : tmp[ 3 ]
				} );
			}
			else
			{
				return false;
			}
		}
		return rule;
	}
}

module.exports = Parser;
