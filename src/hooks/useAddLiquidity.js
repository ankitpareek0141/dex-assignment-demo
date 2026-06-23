import React from 'react';
import { getContractInstance } from '../utils/contracts';
import { ROUTER_ADDRESS } from '../utils/addresses';
import { ROUTER_ABI } from '../utils/routerAbi';

function useAddLiquidity(setTxStatus) {

    async function addLiquidity(
        tokenAAddress,
        tokenBAddress,
        parsedAmountA,
        parsedAmountB,
        signer
    ) {
        console.log(tokenAAddress, tokenBAddress, parsedAmountA, parsedAmountB);
        

        const routerContract = getContractInstance(ROUTER_ADDRESS, ROUTER_ABI, signer);

        // 3. Add Liquidity
        setTxStatus('Adding liquidity... Please confirm transaction');

        const tx = await routerContract.addLiquidity(
            tokenAAddress,
            tokenBAddress,
            parsedAmountA,
            parsedAmountB,
        );
        
        setTxStatus('Transaction submitted... waiting for confirmation');
        
        await tx.wait();

        // SUCCESS
        setTxStatus('Liquidity added successfully 🎉');
    }

    return { addLiquidity }
}

export default useAddLiquidity;
