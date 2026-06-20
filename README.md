# 🦄 Mini Uniswap V2 Clone (DEX Project)

A decentralized exchange (DEX) built using **Solidity, Hardhat, and Ethers.js**, inspired by Uniswap V2.  
It implements core AMM functionality including liquidity pools, swaps, and LP tokens.

---

# ⚙️ Tech Stack

- Solidity ^0.8.x
- Hardhat (v2)
- OpenZeppelin Contracts
- Ethers.js v6
- React (Vite)
- Local Hardhat Network

---

# 🧠 Architecture

User → Router → Factory → Pool → ERC20 Tokens

---

# 📁 Project Structure

contracts/
  - Factory.sol
  - Router.sol
  - Pool.sol
  - MockERC20.sol

scripts/
  - deploy.js

test/
  - dex.test.js

frontend/ (Vite React app)

---

# 🚀 Setup (Backend)

npm install

---

# 🧪 Compile Contracts

npx hardhat compile

---

# ⚡ Start Local Blockchain

npx hardhat node

RPC: http://127.0.0.1:8545  
Chain ID: 31337

---

# 📦 Deploy Contracts

npx hardhat run scripts/deploy.js --network localhost

---

# 🧪 Run Tests

npx hardhat test

---

# 🌐 Frontend (Vite React)

## 1. Install frontend deps

cd frontend
npm install

## 2. Start Vite dev server

npm run dev

Runs at:
http://localhost:5173

---

## 3. Connect MetaMask

Network:
- RPC: http://127.0.0.1:8545
- Chain ID: 31337

---

## 4. Add Contract Config

Create:

frontend/src/config.js

export const ROUTER_ADDRESS = "0x...";
export const FACTORY_ADDRESS = "0x...";
export const TOKEN_A = "0x...";
export const TOKEN_B = "0x...";

---

## 5. Use ABI

Use:

artifacts/contracts/Router.sol/Router.json

---

# 💱 Features

- Add Liquidity
- Remove Liquidity
- Swap Tokens (x * y = k AMM)

---

# ⚠️ Warning

This is a learning project. Not audited. Not for production use.

