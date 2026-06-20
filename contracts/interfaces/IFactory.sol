pragma solidity ^0.8.0;

interface IFactory {
    
    function createPool(
        address tokenA,
        address tokenB
    ) external returns (address pair);

    function getPool(
        address token0,
        address token1
    ) external view returns (address _pair);

}