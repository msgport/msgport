// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./base/BaseMessagePort.sol";
import "./base/PeerLookup.sol";
import "ORMP/src/interfaces/IORMP.sol";
import "ORMP/src/user/AppBase.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract ORMPUpgradeablePort is Ownable2Step, AppBase, BaseMessagePort, PeerLookup {
    using EnumerableSet for EnumerableSet.AddressSet;

    address public ormp;

    EnumerableSet.AddressSet internal historyORMPSet;

    event SetORMP(address previousORMP, address currentORMP);
    event HistoryORMPAdded(address ormp);
    event HistoryORMPDeleted(address ormp);

    modifier onlyORMP() override {
        require(historyORMPSet.contains(msg.sender), "!ormps");
        _;
    }

    modifier checkToDapp(address toDapp) override {
        require(!historyORMPSet.contains(toDapp), "!toDapp");
        _;
    }

    constructor(address dao, address ormp_, string memory name) BaseMessagePort(name) {
        _transferOwnership(dao);
        ormp = ormp_;
        historyORMPSet.add(ormp_);
    }

    /// @notice How to migrate to new ORMP contract.
    /// 1. setORMP to new ORMP contract.
    /// 2. delete previousORMP after relay on-flight message.
    function setORMP(address ormp_) external onlyOwner {
        address previousORMP = ormp;
        ormp = ormp_;
        require(historyORMPSet.add(ormp_), "!add");
        emit SetORMP(previousORMP, ormp_);
        emit HistoryORMPAdded(ormp_);
    }

    function delORMP(address ormp_) external onlyOwner {
        require(ormp != ormp_, "sender");
        require(historyORMPSet.remove(ormp_), "!del");
        emit HistoryORMPDeleted(ormp_);
    }

    function setAppConfig(address ormp_, address oracle, address relayer) external onlyOwner {
        require(historyORMPSet.contains(ormp_), "!exist");
        IORMP(ormp_).setAppConfig(oracle, relayer);
    }

    function setURI(string calldata uri) external onlyOwner {
        _setURI(uri);
    }

    function setPeer(uint256 chainId, address peer) external onlyOwner {
        _setPeer(chainId, peer);
    }

    function historyORMPLength() public view returns (uint256) {
        return historyORMPSet.length();
    }

    function historyORMPs() public view returns (address[] memory) {
        return historyORMPSet.values();
    }

    function historyORMPAt(uint256 index) public view returns (address) {
        return historyORMPSet.at(index);
    }

    function historyORMPContains(address ormp_) public view returns (bool) {
        return historyORMPSet.contains(ormp_);
    }

    function _send(address fromDapp, uint256 toChainId, address toDapp, bytes calldata message, bytes calldata params)
        internal
        override
        returns (bytes32)
    {
        (uint256 gasLimit, address refund, bytes memory ormpParams) = abi.decode(params, (uint256, address, bytes));
        bytes memory encoded = abi.encodeWithSelector(this.recv.selector, fromDapp, toDapp, message);
        return IORMP(ormp).send{value: msg.value}(
            toChainId, _checkedPeerOf(toChainId), gasLimit, encoded, refund, ormpParams
        );
    }

    function recv(address fromDapp, address toDapp, bytes calldata message) public payable virtual onlyORMP {
        uint256 fromChainId = _fromChainId();
        require(_xmsgSender() == _checkedPeerOf(fromChainId), "!auth");
        _recv(_messageId(), fromChainId, fromDapp, toDapp, message);
    }

    function fee(uint256 toChainId, address fromDapp, address toDapp, bytes calldata message, bytes calldata params)
        external
        view
        override
        returns (uint256)
    {
        (uint256 gasLimit,, bytes memory ormpParams) = abi.decode(params, (uint256, address, bytes));
        bytes memory encoded = abi.encodeWithSelector(this.recv.selector, fromDapp, toDapp, message);
        return IORMP(ormp).fee(toChainId, address(this), gasLimit, encoded, ormpParams);
    }
}
