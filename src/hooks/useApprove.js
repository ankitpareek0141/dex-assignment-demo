import React from 'react';
import { tokens } from '../utils/tokens';
import { getContractInstance } from '../utils/contracts';
import { ERC20_ABI } from '../utils/erc20Abi';
import { ROUTER_ADDRESS } from '../utils/addresses';
import { ethers } from 'ethers';

function useApprove(setTxStatus) {
    async function approve(tokenSymbol, amount, signer) {
        const tokenAddress = tokens[tokenSymbol];

        const tokenContract = getContractInstance(
            tokenAddress,
            ERC20_ABI,
            signer,
        );

        // Fetch decimals
        const decimals = await tokenContract.decimals();
        // parsing Amount to decimals
        const parsedAmount = ethers.parseUnits(amount, decimals);

        setTxStatus(`Approving token ${tokenSymbol}...`);

        const tx = await tokenContract.approve(ROUTER_ADDRESS, parsedAmount);
        
        setTxStatus(`Tx Initated: ${tx?.hash}`);

        await tx.wait();

        setTxStatus('Approval given successfully!');

        return [parsedAmount, tokenAddress];
    }

    return { approve };
}

export default useApprove;
