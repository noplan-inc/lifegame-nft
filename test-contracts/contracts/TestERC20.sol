pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BasicToken is ERC20 {
	constructor(uint256 initialBalance) ERC20("Basic", "BSC") public {
		_mint(msg.sender, initialBalance);
	}
}
