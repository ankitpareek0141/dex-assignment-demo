pragma solidity ^0.8.0;

import "./interfaces/IFactory.sol";
import "./interfaces/IPool.sol";
import "./interfaces/IERC20.sol";

import "hardhat/console.sol";

contract SwapRouter {
    IFactory factory;

    event LiquidityAdded(
        address indexed _user,
        address indexed _token0,
        address indexed _token1,
        uint256 _amount0,
        uint256 _amount1,
        address _pool
    );

    event RemoveLiquidity(
        address indexed _token0,
        address indexed _token1,
        uint256 indexed _liquidity
    );

    event Swap(
        address indexed _tokenIn,
        address indexed _tokenOut,
        uint256 indexed _amountIn,
        uint256 _amountOut,
        address _to
    );

    constructor(address _factory) {
        factory = IFactory(_factory);
    }

    function addLiquidity(
        address _token0,
        address _token1,
        uint256 _amount0,
        uint256 _amount1
    ) external payable {
        require(_amount0 > 0 && _amount1 > 0, "Invalid amounts");
        require(_token0 != _token1, "Same tokens");

        address _user = msg.sender;
        address _pool = factory.getPool(_token0, _token1);

        if (_pool == address(0)) {
            _pool = factory.createPool(_token0, _token1);
        }

        // Token transfers
        if (_token0 == address(0)) {
            require(msg.value == _amount0, "ETH Mismatch");
            (bool success, ) = payable(_pool).call{value: msg.value}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(_token0).transferFrom(_user, _pool, _amount0);
        }

        if (_token1 == address(0)) {
            require(msg.value == _amount1, "ETH Mismatch");
            (bool success, ) = payable(_pool).call{value: msg.value}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(_token1).transferFrom(_user, _pool, _amount1);
        }

        IPool(_pool).addLiquidity(_user);

        emit LiquidityAdded(_user, _token0, _token1, _amount0, _amount1, _pool);
    }

    function removeLiquidity(
        address _token0,
        address _token1,
        uint256 _liquidity
    ) external {
        require(_liquidity > 0, "Invalid liquidity");

        address _user = msg.sender;

        address pool = factory.getPool(_token0, _token1);

        // Burn LP tokens and send underlying assets to the user
        IPool(pool).removeLiquidity(_liquidity, _user);

        emit RemoveLiquidity(_token0, _token1, _liquidity);
    }

    function swapExactTokensFromToken(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _minAmountOut
    ) external payable {
        require(_tokenIn != _tokenOut, "Invalid tokens");
        require(_amountIn > 0, "Invalid _amountIn value");

        address _user = msg.sender;

        require(
            IERC20(_tokenIn).balanceOf(_user) >= _amountIn,
            "Insufficient balance"
        );

        address _pool = IFactory(factory).getPool(_tokenIn, _tokenOut);

        IERC20(_tokenIn).transferFrom(_user, _pool, _amountIn);

        uint256 _amountOut = IPool(_pool).swap(_tokenIn, _amountIn, _minAmountOut, _user);
    
        emit Swap(_tokenIn, _tokenOut, _amountIn, _amountOut, _user);
    }
}
