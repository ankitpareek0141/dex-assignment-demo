import { ethers } from 'ethers';
import React, { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext();

export function WalletProvider({ children }) {
    const [account, setAccount] = useState('');
    const [provider, setProvider] = useState();
    const [signer, setSigner] = useState();

    useEffect(() => {
        const onAnnounceProvider = (event) => {
            // event.detail contains provider info (name, icon) and the EIP-1193 provider object
            if (event.detail.info.name === 'MetaMask') {
                console.log(`Discovered wallet: ${event.detail.info.name}`);
                setProvider(event.detail.provider);
            }
        };

        window.addEventListener('eip6963:announceProvider', onAnnounceProvider);
        window.dispatchEvent(new Event('eip6963:requestProvider'));

        return () => {
            window.removeEventListener(
                'eip6963:announceProvider',
                onAnnounceProvider,
            );
        };
    }, []);

    useEffect(() => {
        if (!provider) return;

        checkExistingConnection();

        const handler = (accounts) => {
            setAccount(accounts[0] || '');
        };

        const disconnectHandler = (error) => {
            handelDisconnectWallet();
        };

        // Account change event
        provider.on('accountsChanged', handler);

        // Account disconnect change event
        provider.on('disconnect', disconnectHandler);

        return () => {
            provider.removeListener('accountsChanged', handler);
            provider.removeListener('disconnect', disconnectHandler);
        };
    }, [provider]);

    async function checkExistingConnection() {
        const accounts = await provider.request({
            method: 'eth_accounts',
        });

        await createSigner();

        if (accounts?.length > 0) {
            setAccount(accounts[0]);
        }
    }

    async function handelConnectWallet() {
        try {
            // Request the list of already-authorized accounts without triggering a popup
            const accounts = await provider.request({
                method: 'eth_requestAccounts',
            });

            await createSigner();

            if (accounts?.length > 0) {
                console.log('Auto-connected to existing session:', accounts[0]);
                setAccount(accounts[0]);
            }
        } catch (error) {
            console.error('Failed to check existing session', error);
        }
    }

    async function createSigner() {
        const browserProvider = new ethers.BrowserProvider(provider);
        const signer = await browserProvider.getSigner();
        const user = await signer.getAddress();
        setSigner(signer);
    }

    async function handelDisconnectWallet() {
        setAccount('');
        setSigner();
    }

    return (
        <WalletContext.Provider
            value={{
                account,
                provider,
                signer,
                handelConnectWallet,
                handelDisconnectWallet,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    return useContext(WalletContext);
}
