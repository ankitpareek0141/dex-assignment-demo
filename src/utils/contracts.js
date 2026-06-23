import { ethers } from 'ethers';

export const getContractInstance = (address, abi, signer) => new ethers.Contract(
    address, 
    abi, 
    signer
);
