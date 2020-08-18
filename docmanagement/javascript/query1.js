/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');


async function executeFunction(fucname, docnumber) {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('docmanagement');
        let result;
       // Evaluate the specified transaction.
        //queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        //queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        // result = await contract.evaluateTransaction('queryDocument', 'DOC1');
        // const result = await contract.evaluateTransaction('queryAllCars');
        // const result = await contract.evaluateTransaction('getCarHistory', 'CAR0');
        if (fucname == 'queryAllDocument') {
             result = await contract.evaluateTransaction(fucname);
        }
        else {
             result = await contract.evaluateTransaction(fucname, docnumber);
        }

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        // Disconnect from the gateway.
        await gateway.disconnect();
        console.log(result);
        return result;
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

//main();

var queryChaincode = async function(fucname, docnumber) {
    try {
        // load the network configuration
        return executeFunction(fucname, docnumber);

        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }

}
exports.queryChaincode = queryChaincode;
