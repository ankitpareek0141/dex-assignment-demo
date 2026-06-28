import { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { tokens } from './utils/tokens';
import {
    FACTORY_ADDRESS,
    ROUTER_ADDRESS,
    TOKEN_A_ADDRESS,
    TOKEN_B_ADDRESS,
} from './utils/addresses';
import { ROUTER_ABI } from './utils/routerAbi';
import { ERC20_ABI } from './utils/erc20Abi';
import { FACTORY_ABI } from './utils/factoryAbi';
import useApprove from './hooks/useApprove';
import useAddLiquidity from './hooks/useAddLiquidity';
import useRemoveLiquidity from './hooks/useRemoveLiquidity';
import useSwap from './hooks/useSwap';
import { useWallet } from './context/WalletContext';

function App() {
    const [tab, setTab] = useState('swap');
    // const [account, setAccount] = useState('');
    // const [provider, setProvider] = useState(null);

    const [tokenA, setTokenA] = useState('ETH');
    const [tokenB, setTokenB] = useState('ETH');

    const [amountA, setAmountA] = useState('');
    const [amountB, setAmountB] = useState('');

    const [txStatus, setTxStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const { approve } = useApprove(setTxStatus);
    const { addLiquidity } = useAddLiquidity(setTxStatus);
    const { removeLiquidity } = useRemoveLiquidity(setTxStatus);
    const { swap } = useSwap(setTxStatus);

    const { account, provider, signer, handelConnectWallet, handelDisconnectWallet } =
        useWallet();

    // // Listen for account change
    // useEffect(() => {
    //     const onAnnounceProvider = (event) => {
    //         // event.detail contains provider info (name, icon) and the EIP-1193 provider object
    //         if (event.detail.info.name === 'MetaMask') {
    //             console.log(`Discovered wallet: ${event.detail.info.name}`);
    //             setProvider(event.detail.provider);
    //         }
    //     };

    //     window.addEventListener('eip6963:announceProvider', onAnnounceProvider);
    //     window.dispatchEvent(new Event('eip6963:requestProvider'));

    //     return () => {
    //         window.removeEventListener(
    //             'eip6963:announceProvider',
    //             onAnnounceProvider,
    //         );
    //     };
    // }, []);

    // useEffect(() => {
    //     if (!provider) return;

    //     handelConnectWallet();

    //     const handler = (accounts) => {
    //         setAccount(accounts[0] || '');
    //     };
    //     provider.on('accountsChanged', handler);

    //     return () => {
    //         provider.removeListener('accountsChanged', handler);
    //     };
    // }, [provider]);

    // async function handelConnectWallet() {
    //     try {
    //         // Request the list of already-authorized accounts without triggering a popup
    //         const accounts = await provider.request({
    //             method: 'eth_accounts',
    //         });

    //         if (accounts && accounts.length > 0) {
    //             console.log('Auto-connected to existing session:', accounts[0]);
    //             setAccount(accounts[0]);
    //         }
    //     } catch (error) {
    //         console.error('Failed to check existing session', error);
    //     }
    // }

    async function handleAddLiquidity() {
        setLoading(true);
        setTxStatus('Waiting for wallet confirmation...');

        if (tokenA === tokenB) {
            setLoading(false);
            setTxStatus('');
            alert('Tokens should be different!');
            return;
        }

        try {
            if (!provider) return alert('Error in metamask connection');

            const [parsedAmountA, tokenAAddress] = await approve(
                tokenA,
                amountA,
                signer,
            );

            const [parsedAmountB, tokenBAddress] = await approve(
                tokenB,
                amountB,
                signer,
            );

            await addLiquidity(
                tokenAAddress,
                tokenBAddress,
                parsedAmountA,
                parsedAmountB,
                signer,
            );
        } catch (err) {
            console.error(err);
            setTxStatus('Transaction failed ❌');
        } finally {
            setLoading(false);
            setAmountA('');
            setAmountB('');

            // optional: auto-clear message after delay
            setTimeout(() => {
                setTxStatus('');
            }, 3000);
        }
    }

    async function handleSwap() {
        try {
            setLoading(true);
            setTxStatus('Connecting wallet...');

            if (!provider) return alert('Error in metamask connection');

            const tokenOutAddress = tokens[tokenB];

            const [amountIn, tokenInAddress] = await approve(
                tokenA,
                amountA,
                signer,
            );

            if (!tokenInAddress || !tokenOutAddress) {
                throw new Error('Invalid token selection');
            }

            await swap(tokenInAddress, tokenOutAddress, amountIn, signer);
        } catch (err) {
            console.error(err);
            setTxStatus('Swap failed ❌');
        } finally {
            setLoading(false);

            setAmountA('');
            setAmountB('');

            setTimeout(() => {
                setTxStatus('');
            }, 3000);
        }
    }

    async function handleRemoveLiquidity() {
        try {
            setLoading(true);
            setTxStatus('Connecting wallet...');

            if (!provider) return alert('Error in metamask connection');

            const user = await signer.getAddress();

            await removeLiquidity(amountA, signer, user);
        } catch (err) {
            console.error(err);
            console.error(err?.info?.error?.message);
            setTxStatus(
                err?.info?.error?.message || 'Remove liquidity failed ❌',
            );
        } finally {
            setLoading(false);
            setAmountA('');

            setTimeout(() => {
                setTxStatus('');
            }, 3000);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#1b1f2a] rounded-3xl shadow-2xl p-5">
                {/* Header */}

                <div className="flex justify-between items-center mb-5">
                    <h1 className="text-white text-2xl font-bold">FunSwap</h1>

                    {!account ? (
                        <button
                            className="bg-purple-600 hover:bg-purple-700 transition-colors text-white px-5 py-2 rounded-xl font-semibold"
                            onClick={handelConnectWallet}
                        >
                            Connect Wallet
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="bg-[#2b3040] px-4 py-2 rounded-xl border border-gray-700 text-white font-medium">
                                🦊 {account.slice(0, 6)}...{account.slice(-4)}
                            </div>

                            <button
                                onClick={handelDisconnectWallet}
                                className="px-4 py-2 rounded-xl border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
                            >
                                Disconnect
                            </button>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-3 bg-[#2b3040] rounded-xl p-1 mb-5">
                    <button
                        onClick={() => setTab('swap')}
                        className={`py-2 rounded-lg ${
                            tab === 'swap'
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-300'
                        }`}
                    >
                        Swap
                    </button>

                    <button
                        onClick={() => setTab('add')}
                        className={`py-2 rounded-lg ${
                            tab === 'add'
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-300'
                        }`}
                    >
                        Add
                    </button>

                    <button
                        onClick={() => setTab('remove')}
                        className={`py-2 rounded-lg ${
                            tab === 'remove'
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-300'
                        }`}
                    >
                        Remove
                    </button>
                </div>

                {/* Swap */}
                {tab === 'swap' && (
                    <>
                        <TokenBox
                            title="From"
                            amount={amountA}
                            setAmount={setAmountA}
                            setToken={setTokenA}
                        />

                        <div className="flex justify-center my-3">
                            <button className="bg-[#2b3040] p-2 rounded-full hover:bg-purple-600">
                                ↓
                            </button>
                        </div>

                        <TokenBox
                            title="To"
                            setAmount={setAmountB}
                            setToken={setTokenB}
                        />

                        <div className="mt-4 text-gray-400 text-sm">
                            Price Impact: 0.05%
                        </div>

                        <div className="text-gray-400 text-sm">Fee: 0.3%</div>

                        <button
                            className="w-full mt-5 bg-purple-600 hover:bg-purple-700 py-4 rounded-xl text-white font-bold"
                            onClick={handleSwap}
                            disabled={!account || loading}
                        >
                            Swap
                        </button>
                        {loading && (
                            <div className="mt-4 p-3 rounded bg-blue-600 text-white">
                                {txStatus}
                            </div>
                        )}

                        {!loading && txStatus && (
                            <div className="mt-4 p-3 rounded bg-green-600 text-white">
                                {txStatus}
                            </div>
                        )}
                    </>
                )}

                {/* Add Liquidity */}
                {tab === 'add' && (
                    <>
                        <TokenBox
                            title="Token A"
                            amount={amountA}
                            setAmount={setAmountA}
                            setToken={setTokenA}
                        />

                        <div className="h-3"></div>

                        <TokenBox
                            title="Token B"
                            amount={amountB}
                            setAmount={setAmountB}
                            setToken={setTokenB}
                        />

                        <button
                            className="w-full mt-5 bg-purple-600 hover:bg-purple-700 py-4 rounded-xl text-white font-bold"
                            onClick={handleAddLiquidity}
                            disabled={!account || loading}
                        >
                            Add Liquidity
                        </button>
                        {loading && (
                            <div className="mt-4 p-3 rounded bg-blue-600 text-white break-all">
                                {txStatus}
                            </div>
                        )}

                        {!loading && txStatus && (
                            <div className="mt-4 p-3 rounded bg-green-600 text-white break-all">
                                {txStatus}
                            </div>
                        )}
                    </>
                )}

                {/* Remove Liquidity */}
                {tab === 'remove' && (
                    <>
                        <div className="bg-[#2b3040] rounded-2xl p-4">
                            <p className="text-gray-400 mb-3">LP Amount</p>

                            <input
                                placeholder="0.0"
                                className="w-full bg-transparent text-white text-3xl outline-none"
                                onChange={(e) => setAmountA(e.target.value)}
                            />
                        </div>

                        <button
                            className="w-full mt-5 bg-red-600 hover:bg-red-700 py-4 rounded-xl text-white font-bold"
                            disabled={!account || loading}
                            onClick={handleRemoveLiquidity}
                        >
                            Remove Liquidity
                        </button>
                        {loading && (
                            <div className="mt-4 p-3 rounded bg-blue-600 text-white">
                                {txStatus}
                            </div>
                        )}

                        {!loading && txStatus && (
                            <div className="mt-4 p-3 rounded bg-green-600 text-white">
                                {txStatus}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function TokenBox({ title, amount, setAmount, setToken }) {
    return (
        <div className="bg-[#2b3040] rounded-2xl p-4">
            <div className="text-gray-400 text-sm mb-2">{title}</div>

            <div className="flex justify-between items-center">
                <input
                    type="number"
                    placeholder="0.0"
                    className="bg-transparent text-white text-3xl outline-none w-full"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                <select
                    className="bg-[#444b5f] text-white rounded-lg px-3 py-2"
                    onChange={(e) => setToken(e.target.value)}
                >
                    {Object.keys(tokens).map((token) => {
                        return <option key={token}>{token}</option>;
                    })}
                </select>
            </div>
        </div>
    );
}

export default App;
