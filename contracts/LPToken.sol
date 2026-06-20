// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LPToken {

    string public name;
    string public symbol;
    uint8 public decimals = 18;

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }

    // ===== Events =====
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // ===== Transfer =====
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");

        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;

        emit Transfer(msg.sender, to, amount);
        return true;
    }

    // ===== Approve =====
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;

        emit Approval(msg.sender, spender, amount);
        return true;
    }

    // ===== TransferFrom =====
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {

        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Not allowed");

        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;

        emit Transfer(from, to, amount);
        return true;
    }

    // ===== Mint (for testing only) =====
    function mint(address to, uint256 amount) public {
        balanceOf[to] += amount;
        totalSupply += amount;

        emit Transfer(address(0), to, amount);
    }

    // ===== Burn (for testing only) =====
    function burn(address to, uint256 amount) public {
        balanceOf[to] -= amount;
        totalSupply -= amount;

        emit Transfer(to, address(0), amount);
    }
}