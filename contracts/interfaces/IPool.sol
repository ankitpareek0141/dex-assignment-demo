pragma solidity ^0.8.0;

interface IPool {
    function addLiquidity(address _to) external payable returns(uint256 _liquidity);

    function removeLiquidity(uint256 _liquidity, address _to) external;

    function swap(
        address _tokenIn,
        uint256 _amountIn,
        uint256 _minAmountOut,
        address _to
    ) external returns (uint256 _amountOut);

    function getReserves()
        external
        view
        returns (uint112 _reserve0, uint112 _reserve1);
}
