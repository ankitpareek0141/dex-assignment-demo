import React from 'react';
import { tokens } from '../utils/tokens';
import { FACTORY_ABI } from '../utils/factoryAbi';
import { FACTORY_ADDRESS, ROUTER_ADDRESS } from '../utils/addresses';
import { ethers } from 'ethers';
import { ERC20_ABI } from '../utils/erc20Abi';
import { getContractInstance } from '../utils/contracts';
import { ROUTER_ABI } from '../utils/routerAbi';

function useRemoveLiquidity(setTxStatus) {
    async function removeLiquidity(amount, signer, user) {
        const tokenAAddress = tokens.TOKENA;
        const tokenBAddress = tokens.TOKENB;

        const factoryContract = getContractInstance(
            FACTORY_ADDRESS,
            FACTORY_ABI,
            signer,
        );
        const routerContract = getContractInstance(
            ROUTER_ADDRESS,
            ROUTER_ABI,
            signer,
        );

        const pairAddress = await factoryContract.getPool(
            tokenAAddress,
            tokenBAddress,
        );
        if (!pairAddress || pairAddress === ethers.ZeroAddress) {
            throw new Error('Pair does not exist');
        }

        const lpToken = getContractInstance(
            pairAddress, 
            ERC20_ABI, 
            signer
        );

        // Get LP balance
        const lpBalance = await lpToken.balanceOf(user);

        const amountInParsed = ethers.parseUnits(amount, 18);

        console.log('lp Balance: ', lpBalance);

        if (lpBalance < amountInParsed) {
            throw new Error('Insufficient tokens found');
        }


        setTxStatus('Approving LP tokens...');

        // Approve router to burn LP tokens
        const approveTx = await lpToken.approve(ROUTER_ADDRESS, amountInParsed);
        await approveTx.wait();

        setTxStatus('Removing liquidity...');

        const tx = await routerContract.removeLiquidity(
            tokenAAddress,
            tokenBAddress,
            amountInParsed,
        );
        setTxStatus('Transaction Initiated...');

        await tx.wait();

        setTxStatus('Liquidity removed successfully 🎉');
    };

    return { removeLiquidity };
}

export default useRemoveLiquidity;
