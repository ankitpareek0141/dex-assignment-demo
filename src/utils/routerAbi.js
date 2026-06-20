export const ROUTER_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_factory",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "_user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "_token0",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "_token1",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_amount0",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_amount1",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_pool",
          "type": "address"
        }
      ],
      "name": "LiquidityAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "_token0",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "_token1",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_liquidity",
          "type": "uint256"
        }
      ],
      "name": "RemoveLiquidity",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "_tokenIn",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "_tokenOut",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_amountIn",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_amountOut",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_to",
          "type": "address"
        }
      ],
      "name": "Swap",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_token0",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_token1",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount0",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_amount1",
          "type": "uint256"
        }
      ],
      "name": "addLiquidity",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_token0",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_token1",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_liquidity",
          "type": "uint256"
        }
      ],
      "name": "removeLiquidity",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_tokenIn",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_tokenOut",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amountIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_minAmountOut",
          "type": "uint256"
        }
      ],
      "name": "swapExactTokensFromToken",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }
  ]