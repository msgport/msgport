// This file is part of Darwinia.
// Copyright (C) 2018-2023 Darwinia Network
// SPDX-License-Identifier: GPL-3.0
//
// Darwinia is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Darwinia is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Darwinia. If not, see <https://www.gnu.org/licenses/>.

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "ORMP/src/Common.sol";
import "../interfaces/IMessageRetryablePort.sol";
import "./ExampleReceiverDapp.sol";

contract ExampleRetryableDapp is ExampleReceiverDapp, ReentrancyGuard {
    constructor(address port, address dapp) ExampleReceiverDapp(port, dapp) {}

    function retry(bytes calldata messageData) external payable {
        IMessageRetryablePort(PORT).retry(messageData);
    }

    function clear(bytes calldata messageData) external {
        IMessageRetryablePort(PORT).clear(messageData);
    }
}
