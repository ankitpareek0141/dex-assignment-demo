pragma solidity ^0.8.0;

import "./interfaces/IFactory.sol";
import "./Pool.sol";

contract Factory is IFactory {
    address public swapRouter;
    mapping(address => mapping(address => address)) private pair;

    // This must only be called by the owner (only Owner must be set)
    function setRouter(address _swapRouter) external {
        require(_swapRouter != address(0), "Invalid _swapRouter address!");
        swapRouter = _swapRouter;
    }

    function createPool(
        address _token0,
        address _token1
    ) external returns (address) {
        require(_token0 != _token1, "Same Tokens!");

        address _leftToken;
        address _rightToken;

        if (_token0 < _token1) {
            _leftToken = _token0;
            _rightToken = _token1;
        } else {
            _leftToken = _token1;
            _rightToken = _token0;
        }

        require(
            pair[_leftToken][_rightToken] == address(0),
            "Pool already exists"
        );

        Pool _newPool = new Pool(_leftToken, _rightToken, swapRouter);

        pair[_leftToken][_rightToken] = address(_newPool);

        return address(_newPool);
    }

    function getPool(
        address _token0,
        address _token1
    ) external view returns (address _pool) {
        (address _leftToken, address _rightToken) = _token0 < _token1
            ? (_token0, _token1)
            : (_token1, _token0);

        _pool = pair[_leftToken][_rightToken];

        // require(_pool != address(0), "Pool not exist");

        return _pool;
    }
}
