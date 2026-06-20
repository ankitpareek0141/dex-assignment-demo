import { useState, useEffect } from 'react';
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

function App() {
    const [tab, setTab] = useState('swap');
    const [account, setAccount] = useState('');

    const [tokenA, setTokenA] = useState('ETH');
    const [tokenB, setTokenB] = useState('ETH');

    const [amountA, setAmountA] = useState('');
    const [amountB, setAmountB] = useState('');

    const [txStatus, setTxStatus] = useState('');
    const [loading, setLoading] = useState(false);

    // Auto connect on refresh
    useEffect(() => {
        async function checkConnection() {
            const provider =
                window.ethereum?.providers?.find((p) => p.isMetaMask) ||
                window.ethereum;

            if (!provider) return;

            const accounts = await provider.request({
                method: 'eth_accounts',
            });

            if (accounts.length > 0) {
                setAccount(accounts[0]);
            }
        }

        checkConnection();
    }, []);

    // Listen for account change
    useEffect(() => {
        if (!window.ethereum) return;

        const handler = (accounts) => {
            setAccount(accounts[0] || '');
        };

        window.ethereum.on('accountsChanged', handler);

        return () => {
            window.ethereum.removeListener('accountsChanged', handler);
        };
    }, []);

    async function connectWalletBtn() {
        try {
            const provider = window.ethereum.providers?.find((p) => {
                return p.isMetaMask === true && p.isPhantom !== true;
            });
            console.log(provider);

            try {
                const accounts = await provider.request({
                    method: 'eth_requestAccounts',
                });
                console.log('connected to: ', accounts);

                await provider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
                });

                setAccount(accounts[0]);
            } catch (err) {
                console.log('Error := ', err);
            }
        } catch (error) {
            console.error('Connection failed:', error.message);
        }
    }

    function getMetamaskInjectedProvider() {
        const injectedProvider = window.ethereum.providers?.find(
            (p) => p.isMetaMask && !p.isPhantom,
        );

        if (!injectedProvider) {
            alert('MetaMask not found');
            return null;
        }

        return injectedProvider;
    }

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
            const injectedProvider = getMetamaskInjectedProvider();

            if (!injectedProvider) return alert('Error in metamask connection');

            const provider = new ethers.BrowserProvider(injectedProvider);
            const signer = await provider.getSigner();
            const user = await signer.getAddress();

            const router = new ethers.Contract(
                ROUTER_ADDRESS,
                ROUTER_ABI,
                signer,
            );

            const tokenAAddress = tokens[tokenA];
            const tokenBAddress = tokens[tokenB];

            const tokenAContract = new ethers.Contract(
                tokenAAddress,
                ERC20_ABI,
                signer,
            );

            const tokenBContract = new ethers.Contract(
                tokenBAddress,
                ERC20_ABI,
                signer,
            );

            // Fetch decimals
            const decimalsA = await tokenAContract.decimals();
            const decimalsB = await tokenBContract.decimals();

            const parsedAmountA = ethers.parseUnits(amountA, decimalsA);
            const parsedAmountB = ethers.parseUnits(amountB, decimalsB);

            // ---------------------------
            // 1. Approve Token A
            // ---------------------------
            setTxStatus('Approving Token A...');

            const tx1 = await tokenAContract.approve(
                ROUTER_ADDRESS,
                parsedAmountA,
            );
            await tx1.wait();

            // ---------------------------
            // 2. Approve Token B
            // ---------------------------
            setTxStatus('Approving Token B...');

            const tx2 = await tokenBContract.approve(
                ROUTER_ADDRESS,
                parsedAmountB,
            );
            await tx2.wait();

            // ---------------------------
            // 3. Add Liquidity
            // ---------------------------
            setTxStatus('Adding liquidity... Please confirm transaction');

            const tx = await router.addLiquidity(
                tokenAAddress,
                tokenBAddress,
                parsedAmountA,
                parsedAmountB,
            );

            setTxStatus('Transaction submitted... waiting for confirmation');

            await tx.wait();

            // ---------------------------
            // SUCCESS
            // ---------------------------
            setTxStatus('Liquidity added successfully 🎉');
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

            const injectedProvider = getMetamaskInjectedProvider();

            if (!injectedProvider) return alert('Error in metamask connection');

            const provider = new ethers.BrowserProvider(injectedProvider);
            const signer = await provider.getSigner();
            const user = await signer.getAddress();

            const router = new ethers.Contract(
                ROUTER_ADDRESS,
                ROUTER_ABI,
                signer,
            );

            const tokenInAddress = tokens[tokenA];
            const tokenOutAddress = tokens[tokenB];

            if (!tokenInAddress || !tokenOutAddress) {
                throw new Error('Invalid token selection');
            }

            const tokenInContract = new ethers.Contract(
                tokenInAddress,
                ERC20_ABI,
                signer,
            );

            const decimalsIn = await tokenInContract.decimals();
            const amountInParsed = ethers.parseUnits(amountA, decimalsIn);

            // 1. Approve router
            setTxStatus('Approving token...');

            const approveTx = await tokenInContract.approve(
                ROUTER_ADDRESS,
                amountInParsed,
            );
            await approveTx.wait();

            // 2. Swap parameters
            setTxStatus('Preparing swap...');

            const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

            const amountsOutMin = 0; // ⚠️ later add slippage protection

            const path = [tokenInAddress, tokenOutAddress];

            setTxStatus('Swapping tokens...');

            const swapTx = await router.swapExactTokensFromToken(
                tokenInAddress,
                tokenOutAddress,
                amountInParsed,
                0,
            );

            setTxStatus('Transaction submitted... waiting confirmation');

            await swapTx.wait();

            setTxStatus('Swap successful 🎉');
        } catch (err) {
            console.error(err);
            setTxStatus('Swap failed ❌');
        } finally {
            setLoading(false);
            
            setAmountA('')
            setAmountB('')

            setTimeout(() => {
                setTxStatus('');
            }, 3000);
        }
    }

    async function handleRemoveLiquidity() {
        try {
            setLoading(true);
            setTxStatus('Connecting wallet...');

            const injectedProvider = getMetamaskInjectedProvider();

            const provider = new ethers.BrowserProvider(injectedProvider);
            const signer = await provider.getSigner();
            const user = await signer.getAddress();

            const factory = new ethers.Contract(
                FACTORY_ADDRESS,
                FACTORY_ABI,
                signer,
            );
            const router = new ethers.Contract(
                ROUTER_ADDRESS,
                ROUTER_ABI,
                signer,
            );

            // LP Token address (pair address)
            const tokenAAddress = tokens.TOKENA;
            const tokenBAddress = tokens.TOKENB;
            

            const pairAddress = await factory.getPool(
                tokenAAddress,
                tokenBAddress,
            );

            if (!pairAddress || pairAddress === ethers.ZeroAddress) {
                throw new Error('Pair does not exist');
            }

            const lpToken = new ethers.Contract(pairAddress, ERC20_ABI, signer);

            // Get LP balance
            const lpBalance = await lpToken.balanceOf(user);
            
            // const amountInParsed = ethers.parseUnits(amountA, 18);

            // console.log(lpBalance ,"  ", amountInParsed);
            

            if (lpBalance === 0n) {
                throw new Error('Insufficient tokens found');
            }

            setTxStatus('Approving LP tokens...');

            // Approve router to burn LP tokens
            const approveTx = await lpToken.approve(ROUTER_ADDRESS, lpBalance);
            await approveTx.wait();

            setTxStatus('Removing liquidity...');

            const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

            const tx = await router.removeLiquidity(
                tokenAAddress,
                tokenBAddress,
                lpBalance,
            );

            setTxStatus('Transaction submitted...');

            await tx.wait();

            setTxStatus('Liquidity removed successfully 🎉');
        } catch (err) {
            console.error(err);
            setTxStatus(err.message || 'Remove liquidity failed ❌');
        } finally {
            setLoading(false);
            setAmountA('')

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
                    <h1 className="text-white text-2xl font-bold">My DEX</h1>

                    <button
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-semibold"
                        onClick={connectWalletBtn}
                    >
                        {account
                            ? account.slice(0, 6) + '...' + account.slice(-4)
                            : 'Connect Wallet'}
                    </button>
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
                            disabled={!account}
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
                            setAmount={setAmountA}
                            setToken={setTokenA}
                        />

                        <div className="h-3"></div>

                        <TokenBox
                            title="Token B"
                            setAmount={setAmountB}
                            setToken={setTokenB}
                        />

                        <button
                            className="w-full mt-5 bg-green-600 hover:bg-green-700 py-4 rounded-xl text-white font-bold"
                            disabled={!account}
                            onClick={handleAddLiquidity}
                        >
                            Add Liquidity
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
                            disabled={!account}
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

function TokenBox({ title, setAmount, token, setToken }) {
    return (
        <div className="bg-[#2b3040] rounded-2xl p-4">
            <div className="text-gray-400 text-sm mb-2">{title}</div>

            <div className="flex justify-between items-center">
                <input
                    type="number"
                    placeholder="0.0"
                    className="bg-transparent text-white text-3xl outline-none w-full"
                    value={token}
                    onChange={(e) => setAmount(e.target.value)}
                />

                <select
                    className="bg-[#444b5f] text-white rounded-lg px-3 py-2"
                    onChange={(e) => setToken(e.target.value)}
                >
                    {Object.keys(tokens).map((token) => {
                        return <option>{token}</option>;
                    })}
                    {/* <option>ETH</option>
                    <option>USDC</option>
                    <option>DAI</option> */}
                </select>
            </div>
        </div>
    );
}

export default App;
