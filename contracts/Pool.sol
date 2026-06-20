pragma solidity ^0.8.0;

import "./interfaces/IPool.sol";
import "./interfaces/IERC20.sol";
import "./LPToken.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract Pool is IPool, LPToken {
    address public token0;
    address public token1;

    address private immutable router;

    uint112 public reserve0;
    uint112 public reserve1;

    constructor(
        address _token0,
        address _token1,
        address _router
    ) LPToken("LPToken", "LPT") {
        token0 = _token0;
        token1 = _token1;
        router = _router;
    }

    receive() external payable {
        // emit Received(msg.sender, msg.value);
    }

    function addLiquidity(
        address _to
    ) external payable returns (uint256 _liquidity) {
        uint256 _balance0;
        uint256 _balance1;

        if (token0 == address(0)) {
            _balance0 = address(this).balance;
        } else {
            _balance0 = IERC20(token0).balanceOf(address(this));
        }

        if (token1 == address(0)) {
            _balance1 = address(this).balance;
        } else {
            _balance1 = IERC20(token1).balanceOf(address(this));
        }
        // uint256 _balance0 = IERC20(token0).balanceOf(address(this));
        // uint256 _balance1 = IERC20(token1).balanceOf(address(this));

        uint256 _amount0 = _balance0 - reserve0;
        uint256 _amount1 = _balance1 - reserve1;

        require(_amount0 > 0 && _amount1 > 0, "No liquidity added");

        if (totalSupply == 0) {
            _liquidity = Math.sqrt(_amount0 * _amount1);
        } else {
            _liquidity = Math.min(
                (_amount0 * totalSupply) / reserve0,
                (_amount1 * totalSupply) / reserve1
            );
        }

        mint(_to, _liquidity);

        // update reserves
        reserve0 = uint112(_balance0);
        reserve1 = uint112(_balance1);
    }

    function removeLiquidity(uint256 _liquidity, address _to) external {
        require(msg.sender == router, "Only Router can call!");
        require(balanceOf[_to] >= _liquidity, "Insufficient LP Tokens");

        uint256 _totalSupply = totalSupply;

        uint256 _amount0 = (_liquidity * reserve0) / _totalSupply;
        uint256 _amount1 = (_liquidity * reserve1) / _totalSupply;

        burn(_to, _liquidity);

        IERC20(token0).transfer(_to, _amount0);
        IERC20(token1).transfer(_to, _amount1);

        // Just to Sync the reserves in case someone
        // sends tokens directly to the pool
        reserve0 = uint112(IERC20(token0).balanceOf(address(this)));
        reserve1 = uint112(IERC20(token1).balanceOf(address(this)));
    }

    function swap(
        address _tokenIn,
        uint256 _amountIn,
        uint256 _minAmountOut,
        address _to
    ) external returns (uint256 amountOut) {
        require(msg.sender == router, "Unauthorized caller");
        require(_tokenIn == token0 || _tokenIn == token1, "Invalid token");

        bool isToken0 = _tokenIn == token0;

        (uint256 reserveIn, uint256 reserveOut) = isToken0
            ? (reserve0, reserve1)
            : (reserve1, reserve0);

        require(_amountIn > 0, "Invalid input");

        // 1. Apply fee (0.3%)
        uint256 amountInWithFee = _amountIn * 997;

        // 2. Constant product formula
        // amountOut = (amountInWithFee * reserveOut) / (reserveIn * 1000 + amountInWithFee)

        amountOut =
            (amountInWithFee * reserveOut) /
            (reserveIn * 1000 + amountInWithFee);

        require(amountOut > 0, "Insufficient output");
        
        require(amountOut >= _minAmountOut, "Slippage Exceeded");

        // 3. Transfer tokens
        if (isToken0) {
            IERC20(token1).transfer(_to, amountOut);
        } else {
            IERC20(token0).transfer(_to, amountOut);
        }

        // 4. Update reserves (IMPORTANT)
        reserve0 = uint112(IERC20(token0).balanceOf(address(this)));
        reserve1 = uint112(IERC20(token1).balanceOf(address(this)));

        return amountOut;
    }

    function getReserves()
        external
        view
        returns (uint112 _reserve0, uint112 _reserve1)
    {}
}
