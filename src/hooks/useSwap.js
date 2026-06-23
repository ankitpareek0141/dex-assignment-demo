import { ethers } from 'ethers';
import React from 'react';
import { getContractInstance } from '../utils/contracts';
import { ROUTER_ABI } from '../utils/routerAbi';
import { ROUTER_ADDRESS } from '../utils/addresses';
import { ERC20_ABI } from '../utils/erc20Abi';

function swap(setTxStatus) {
    async function swap(tokenInAddress, tokenOutAddress, amountIn, signer) {
        const routerContract = getContractInstance(
            ROUTER_ADDRESS,
            ROUTER_ABI,
            signer,
        );

        // 2. Swap parameters
        setTxStatus('Preparing swap...');

        const amountsOutMin = 0; // ⚠️ later add slippage protection

        // const path = [tokenInAddress, tokenOutAddress];

        setTxStatus('Swapping tokens...');

        const tx = await routerContract.swapExactTokensFromToken(
            tokenInAddress,
            tokenOutAddress,
            amountIn,
            amountsOutMin,
        );

        setTxStatus('Transaction submitted... waiting confirmation');

        await tx.wait();

        setTxStatus('Swap successful 🎉');
    }

    return [swap];
}

export default useSwap;
