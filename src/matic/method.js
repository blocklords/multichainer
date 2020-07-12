const Utils = require('./cryptoutils');


var Method = function(contract, params, methodType) {
    if (!Method.isMethodType(methodType)) {
      throw `Unsupported method type ${methodType} was given`;
    }

    // define here all reserved words. as a property using this pointer.
    // Or as an element of reserved.
    // For example, reserved [ 'methodInvocation' ] is a name of the function to be accessible
    this.methodType = methodType;
    this.contract = contract;
    this.params = params;
    let reserved = ['as', 'account'];

    for (var prop in contract.abi.methods) {
        // not a method name
        if (!Object.prototype.hasOwnProperty.call(contract.abi.methods, prop)) {
            continue;
        }

        // this is an artifact function that includes the method arguments.
        if (prop.indexOf('(') > -1) {
            continue;
        }

        if (Object.prototype.hasOwnProperty.call(this, prop) || reserved.indexOf(prop) > -1) {
            throw `The ${prop} is a reserved word.`;
        }

        // recopy the prop, because `prop` variable will be changed within scope
        let methodName = prop;
        this[prop] = function() {
            // returns a promise
            return Method.methodInvocation(this, methodName, arguments);
        };
    }

    return this;
};

/*************************************************************************************************************
 * Method Type
 * ***********************************************************************************************************
 */
Method.CALL = 'CALL';
Method.SEND = 'SEND';
Method.isMethodType = function(methodType) {
  return (methodType === Method.CALL || Method.SEND === methodType);
};

// multichainer.lordsToken.call().as(account).isValid(params).then().catch();

/**************************************************************************************************************
 * Setting the invoker
 **************************************************************************************************************
 */
Method.prototype.as = function(account) {
    this.account = account;
    console.log(account);
    return this;
},

/**************************************************************************************************************
 * Invoking a method
 **************************************************************************************************************
 */
Method.methodInvocation = function(method, methodName, args) {
    console.log("Called "+methodName+" with arguments:");
    console.log(args);

    let ref = method.contract.abi.methods[methodName];
    if (method.methodType === Method.CALL) {
        return ref(...args).call({});
    }
    else if (method.methodType === Method.SEND) {
        method.account.multichainer.provider.setSigner(method.account);

        return ref(...args).send({from: method.account.default.address, gasPrice: 27000000000, gas: 1100000 });
    }
};

// // Get some data
// Smartcontract.prototype.call = function (arguments) {
//     let name = arguments[0];

//     let method = this.contract.instance.methods[name];

//     // TODO change the function to invoke methods directly from the top smartcontract module
//    	if (method === undefined) {
//    		console.trace("Unsupported method name "+name);
//       process.exit(1);
//    	}

//    	let parameters = arguments.slice(1);
//     if (parameters.length > 0) {
//       return method(...parameters).call({ from: this.account.address.toString() });
//    	}
//     return method().call({ from: this.account.address.toString() });
// };


// // Set some data
// Smartcontract.prototype.send = function (arguments) {
//     let name = arguments[0];

//     let method = this.contract.instance.methods[name];

//     // TODO change the function to invoke methods directly from the top smartcontract module
//     if (method === undefined) {
//       console.trace("Unsupported method name "+name);
//       process.exit(1);
//     }

//     let parameters = arguments.slice(1);
//     if (parameters.length > 0) {
//       return method(...parameters).send({ from: this.account.address.toString() });
//     }
//     return method().send({ from: this.account.address.toString() });
// };

module.exports = Method;
