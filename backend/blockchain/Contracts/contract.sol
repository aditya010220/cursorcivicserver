// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CampaignPolling is Ownable, ReentrancyGuard {
    struct Poll {
        string campaignId;
        string title;
        string description;
        string[] options;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        mapping(uint256 => uint256) voteCounts;
        mapping(address => bool) hasVoted;
    }

    mapping(uint256 => Poll) public polls;
    uint256 private _pollCounter;

    event PollCreated(
        uint256 indexed pollId,
        string indexed campaignId,
        string title,
        uint256 startTime,
        uint256 endTime
    );

    event VoteCast(
        uint256 indexed pollId,
        address indexed voter,
        uint8 optionIndex
    );

    function createPoll(
        string memory campaignId,
        string memory title,
        string memory description,
        string[] memory options,
        uint256 durationInDays
    ) external onlyOwner returns (uint256) {
        require(options.length > 1, "Must have at least 2 options");
        require(durationInDays > 0, "Duration must be positive");

        uint256 pollId = _pollCounter++;
        Poll storage newPoll = polls[pollId];

        newPoll.campaignId = campaignId;
        newPoll.title = title;
        newPoll.description = description;
        newPoll.options = options;
        newPoll.startTime = block.timestamp;
        newPoll.endTime = block.timestamp + (durationInDays * 1 days);
        newPoll.isActive = true;

        emit PollCreated(
            pollId,
            campaignId,
            title,
            newPoll.startTime,
            newPoll.endTime
        );

        return pollId;
    }

    function castVote(uint256 pollId, uint8 optionIndex) external nonReentrant {
        Poll storage poll = polls[pollId];
        
        require(poll.startTime != 0, "Poll does not exist");
        require(poll.isActive, "Poll is not active");
        require(block.timestamp >= poll.startTime, "Poll has not started");
        require(block.timestamp <= poll.endTime, "Poll has ended");
        require(!poll.hasVoted[msg.sender], "Already voted");
        require(optionIndex < poll.options.length, "Invalid option");

        poll.voteCounts[optionIndex]++;
        poll.hasVoted[msg.sender] = true;

        emit VoteCast(pollId, msg.sender, optionIndex);
    }

    function getPollDetails(uint256 pollId) external view returns (
        uint256 id,
        string memory campaignId,
        string memory title,
        string memory description,
        string[] memory options,
        uint256 startTime,
        uint256 endTime,
        bool isActive,
        bool hasUserVoted
    ) {
        Poll storage poll = polls[pollId];
        require(poll.startTime != 0, "Poll does not exist");

        return (
            pollId,
            poll.campaignId,
            poll.title,
            poll.description,
            poll.options,
            poll.startTime,
            poll.endTime,
            poll.isActive,
            poll.hasVoted[msg.sender]
        );
    }

    function getPollVoteCounts(uint256 pollId) external view returns (uint256[] memory) {
        Poll storage poll = polls[pollId];
        require(poll.startTime != 0, "Poll does not exist");

        uint256[] memory counts = new uint256[](poll.options.length);
        for (uint256 i = 0; i < poll.options.length; i++) {
            counts[i] = poll.voteCounts[i];
        }
        return counts;
    }

    function togglePollStatus(uint256 pollId, bool isActive) external onlyOwner {
        Poll storage poll = polls[pollId];
        require(poll.startTime != 0, "Poll does not exist");
        poll.isActive = isActive;
    }

    function getTotalPolls() external view returns (uint256) {
        return _pollCounter;
    }
}