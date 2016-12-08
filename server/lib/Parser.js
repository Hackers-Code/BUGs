class Parser {
	constructor( defRule )
	{
		this.defaultRule = defRule;
	}

	static validateBuffer( rule, buffer )
	{
		let offset = 0;
		let object = {};
		for( let i = 0 ; i < rule.length ; i++ )
		{
			if( isNaN( parseInt( rule[ i ].length ) ) )
			{
				rule[ i ].length = object[ rule[ i ].length ].readInt8( 0 );
			}
			if( typeof rule[ i ].conditionName !== 'undefined' )
			{
				if( object[ rule[ i ].conditionName ] !== rule[ i ].conditionValue )
				{
					continue;
				}
			}
			object[ rule[ i ].name ] = buffer.slice( offset, offset += parseInt( rule[ i ].length ) );
			if( buffer.length < offset )
			{
				return false;
			}
		}
		return true;
	}

	encode( ruleString, object )
	{
		let rule = this.createRule( ruleString );
		let buffer = Buffer.from( [] );
		for( let i = 0 ; i < rule.length ; i++ )
		{
			if( isNaN( parseInt( rule[ i ].length ) ) )
			{
				rule[ i ].length = object[ rule[ i ].length ].readInt8( 0 );
			}
			if( typeof rule[ i ].conditionName !== 'undefined' )
			{
				if( Buffer.compare( object[ rule[ i ].conditionName ], rule[ i ].conditionValue ) !== 0 )
				{
					continue;
				}
			}
			if( object[ rule[ i ].name ] instanceof Buffer )
			{
				buffer = Buffer.concat( [
					buffer,
					object[ rule[ i ].name ]
				] );
			}
			else
			{
				console.log( 'Object properties must be the buffers!' );
				return false;
			}
		}
		if( Parser.validateBuffer( rule, buffer ) )
		{
			return buffer;
		}
		else
		{
			console.log( 'Unable to create buffer from this rule' );
			console.log( 'Buffer rule: ' + ruleString );
			console.log( 'Object: ' + JSON.stringify( object ) );
			console.log( 'Buffer: ' + buffer.toString( 'hex' ) );
			return false;
		}
	}

	decode( ruleString, buffer )
	{
		let rule = this.createRule( ruleString );
		if( Parser.validateBuffer( rule, buffer ) )
		{
			let offset = 0;
			let object = {};
			for( let i = 0 ; i < rule.length ; i++ )
			{
				if( isNaN( parseInt( rule[ i ].length ) ) )
				{
					rule[ i ].length = object[ rule[ i ].length ].readInt8( 0 );
				}
				object[ rule[ i ].name ] = buffer.slice( offset, offset += parseInt( rule[ i ].length ) );
			}
			return object;
		}
		else
		{
			console.log( 'Unable to parse buffer' );
			console.log( 'Parsing rule: ' + ruleString );
			console.log( 'Buffer: ' + buffer.toString( 'hex' ) );
			return false;
		}
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
		for( let i = 0 ; i < ruleString.length ; i++ )
		{
			let data = ruleString[ i ].split( ':' );
			if( data[ 1 ].split( '&' ).length > 1 )
			{
				rule.push( {
					name : data[ 0 ],
					length : data[ 1 ].split( '&' )[ 0 ],
					conditionName : data[ 1 ].split( '&' )[ 1 ].split( '=' )[ 0 ],
					conditionValue : Buffer.from( [ data[ 1 ].split( '&' )[ 1 ].split( '=' )[ 1 ] ] )
				} );
			}
			else
			{
				rule.push( {
					name : data[ 0 ],
					length : data[ 1 ]
				} );
			}
		}
		return rule;
	}
}
module.exports = Parser;