// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract CoinCoin {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    string private _name;
    string private _symbol;
    uint256 private _totalSupply;

    event Transfer(
        address indexed sender,
        address indexed receipient,
        uint256 amount
    );
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 amount
    );

    constructor(address owner_, uint256 totalSupply_) {
        _name = "CoinCoin";
        _symbol = "COIN";
        _balances[owner_] = totalSupply_;
        emit Transfer(address(0), owner_, totalSupply_);
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) external {
        _transfer(msg.sender, to, amount);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public {
        uint256 currentAllowance = _allowances[from][msg.sender];
        _transfer(from, to, amount);
        require(
            currentAllowance >= amount,
            "CoinCoin: transfer amount exceeds allowance"
        );
        _approve(from, msg.sender, currentAllowance - amount);
    }

    function approve(address spender, uint256 amount) public {
        _approve(msg.sender, spender, amount);
    }

    function allowance(address owner, address spender)
        public
        view
        returns (uint256)
    {
        return _allowances[owner][spender];
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) private {
        require(
            sender != address(0),
            "CoinCoin: transfer from the zero address"
        );
        require(
            recipient != address(0),
            "CoinCoin: transfer to the zero address"
        );
        require(_balances[sender] >= amount, "CoinCoin: Not enough CoinCoin");
        _balances[sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) private {
        require(owner != address(0), "CoinCoin: approve from the zero address");
        require(spender != address(0), "CoinCoin: approve to the zero address");
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}
