import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import AccessControl "authorization/access-control";

import MixinAuthorization "authorization/MixinAuthorization";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // USER PROFILES
  public type UserProfile = {
    userId : Principal;
    username : Text;
    displayName : Text;
  };

  public type UserProfileWithRole = {
    userId : Principal;
    username : Text;
    displayName : Text;
    role : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(userId : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(userId);
  };

  public query ({ caller }) func getAllUserProfiles() : async [UserProfileWithRole] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    let profiles = userProfiles.values().toArray();
    profiles.map(
      func(p : UserProfile) : UserProfileWithRole {
        let roleText = switch (accessControlState.userRoles.get(p.userId)) {
          case (?(#admin)) { "admin" };
          case (?(#user)) { "user" };
          case (_) { "user" };
        };
        {
          userId = p.userId;
          username = p.username;
          displayName = p.displayName;
          role = roleText;
        };
      }
    );
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let updatedProfile = {
      userId = caller;
      username = profile.username;
      displayName = profile.displayName;
    };
    userProfiles.add(caller, updatedProfile);
    // Auto-grant admin to the owner account
    if (profile.username == "mr_science1469") {
      accessControlState.userRoles.add(caller, #admin);
    };
  };

  public shared ({ caller }) func updateDisplayName(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update display name");
    };
    switch (userProfiles.get(caller)) {
      case (?profile) {
        let updatedProfile = {
          userId = profile.userId;
          username = profile.username;
          displayName = name;
        };
        userProfiles.add(caller, updatedProfile);
      };
      case (null) {
        Runtime.trap("Profile not found");
      };
    };
  };

  // NEWS POSTS
  public type NewsPost = {
    id : Nat;
    title : Text;
    content : Text;
    author : Principal;
    timestamp : Int;
    isAnnouncement : Bool;
  };

  var nextNewsPostId : Nat = 0;
  let newsPosts = Map.empty<Nat, NewsPost>();

  public shared ({ caller }) func createNewsPost(title : Text, content : Text, isAnnouncement : Bool) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create news posts");
    };
    let id = nextNewsPostId;
    nextNewsPostId += 1;
    let post : NewsPost = {
      id;
      title;
      content;
      author = caller;
      timestamp = Time.now();
      isAnnouncement;
    };
    newsPosts.add(id, post);
    id;
  };

  public shared ({ caller }) func updateNewsPost(id : Nat, title : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update news posts");
    };

    switch (newsPosts.get(id)) {
      case (?post) {
        let isMrScience = switch (userProfiles.get(caller)) {
          case (?profile) { profile.username == "mr_science1469" };
          case (null) { false };
        };
        let isAuthor = post.author == caller;

        if (not (isMrScience or isAuthor)) {
          Runtime.trap("Unauthorized: Only mr_science1469 or the original author can update news posts");
        };

        let updatedPost = {
          id = post.id;
          title;
          content;
          author = post.author;
          timestamp = post.timestamp;
          isAnnouncement = post.isAnnouncement;
        };
        newsPosts.add(id, updatedPost);
      };
      case (null) {
        Runtime.trap("News post not found");
      };
    };
  };

  public shared ({ caller }) func deleteNewsPost(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete news posts");
    };

    switch (newsPosts.get(id)) {
      case (?post) {
        let isMrScience = switch (userProfiles.get(caller)) {
          case (?profile) { profile.username == "mr_science1469" };
          case (null) { false };
        };
        let isAuthor = post.author == caller;

        if (not (isMrScience or isAuthor)) {
          Runtime.trap("Unauthorized: Only mr_science1469 or the original author can delete news posts");
        };

        newsPosts.remove(id);
      };
      case (null) {
        Runtime.trap("News post not found");
      };
    };
  };

  public query func getNewsPosts() : async [NewsPost] {
    let posts = newsPosts.values().toArray();
    posts.sort(
      func(a, b) {
        if (a.timestamp > b.timestamp) { #less } else if (a.timestamp < b.timestamp) {
          #greater;
        } else {
          #equal;
        };
      }
    );
  };

  // NEWS REQUESTS
  public type NewsRequest = {
    id : Nat;
    requester : Principal;
    requesterName : Text;
    message : Text;
    timestamp : Int;
  };

  var nextNewsRequestId : Nat = 0;
  let newsRequests = Map.empty<Nat, NewsRequest>();

  public shared ({ caller }) func submitNewsRequest(requesterName : Text, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit news requests");
    };
    let id = nextNewsRequestId;
    nextNewsRequestId += 1;
    let req : NewsRequest = {
      id;
      requester = caller;
      requesterName;
      message;
      timestamp = Time.now();
    };
    newsRequests.add(id, req);
  };

  public query ({ caller }) func getNewsRequests() : async [NewsRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view news requests");
    };
    newsRequests.values().toArray();
  };

  public shared ({ caller }) func dismissNewsRequest(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can dismiss news requests");
    };
    newsRequests.remove(id);
  };

  // LEADERBOARD
  public type LeaderboardEntry = {
    id : Nat;
    studentName : Text;
    scores : [(Text, Nat)];
    totalScore : Nat;
    rank : Nat;
  };

  var nextLeaderboardId : Nat = 0;
  let leaderboard = Map.empty<Nat, LeaderboardEntry>();

  public shared ({ caller }) func setLeaderboardEntry(studentName : Text, scores : [(Text, Nat)]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set leaderboard entries");
    };

    var total : Nat = 0;
    for ((_, score) in scores.values()) {
      total += score;
    };

    var existingId : ?Nat = null;
    for ((id, entry) in leaderboard.entries()) {
      if (entry.studentName == studentName) { existingId := ?id };
    };

    let id = switch (existingId) {
      case (?eid) { eid };
      case (null) {
        let newId = nextLeaderboardId;
        nextLeaderboardId += 1;
        newId;
      };
    };

    let entry : LeaderboardEntry = {
      id;
      studentName;
      scores;
      totalScore = total;
      rank = 0;
    };
    leaderboard.add(id, entry);
  };

  public shared ({ caller }) func deleteLeaderboardEntry(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete leaderboard entries");
    };
    leaderboard.remove(id);
  };

  public query func getLeaderboard() : async [LeaderboardEntry] {
    let entries = leaderboard.values().toArray();
    let sorted = entries.sort(
      func(a, b) {
        if (a.totalScore > b.totalScore) { #less } else if (a.totalScore < b.totalScore) {
          #greater;
        } else {
          #equal;
        };
      }
    );

    var rank = 1;
    sorted.map(
      func(entry) {
        let ranked = {
          id = entry.id;
          studentName = entry.studentName;
          scores = entry.scores;
          totalScore = entry.totalScore;
          rank;
        };
        rank += 1;
        ranked;
      }
    );
  };

  // ELECTION
  public type Candidate = {
    id : Nat;
    name : Text;
    photo : ?Text;
    bio : Text;
    voteCount : Nat;
  };

  var nextCandidateId : Nat = 0;
  let candidates = Map.empty<Nat, Candidate>();
  let votes = Map.empty<Principal, Nat>();
  let votersByCandidateMap = Map.empty<Nat, [Principal]>();
  var electionOpen : Bool = false;

  public shared ({ caller }) func addCandidate(name : Text, bio : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add candidates");
    };
    let id = nextCandidateId;
    nextCandidateId += 1;
    let candidate : Candidate = {
      id;
      name;
      photo = null;
      bio;
      voteCount = 0;
    };
    candidates.add(id, candidate);
    votersByCandidateMap.add(id, []);
    id;
  };

  public shared ({ caller }) func updateCandidate(id : Nat, name : Text, bio : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update candidates");
    };
    switch (candidates.get(id)) {
      case (?candidate) {
        let updated = {
          id = candidate.id;
          name;
          photo = candidate.photo;
          bio;
          voteCount = candidate.voteCount;
        };
        candidates.add(id, updated);
      };
      case (null) {
        Runtime.trap("Candidate not found");
      };
    };
  };

  public shared ({ caller }) func removeCandidate(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove candidates");
    };
    candidates.remove(id);
    votersByCandidateMap.remove(id);
  };

  public shared ({ caller }) func castVote(candidateId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can vote");
    };
    if (not electionOpen) { Runtime.trap("Election is not open") };
    if (votes.containsKey(caller)) { Runtime.trap("You have already voted") };
    switch (candidates.get(candidateId)) {
      case (?candidate) {
        let updated = {
          id = candidate.id;
          name = candidate.name;
          photo = candidate.photo;
          bio = candidate.bio;
          voteCount = candidate.voteCount + 1;
        };
        candidates.add(candidateId, updated);
        votes.add(caller, candidateId);

        let currentVoters = switch (votersByCandidateMap.get(candidateId)) {
          case (?voters) { voters };
          case (null) { [] };
        };
        let newVoters = currentVoters.concat([caller]);
        votersByCandidateMap.add(candidateId, newVoters);
      };
      case (null) {
        Runtime.trap("Candidate not found");
      };
    };
  };

  public query ({ caller }) func hasVoted() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check vote status");
    };
    votes.containsKey(caller);
  };

  public query ({ caller }) func getElectionResults() : async [Candidate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view election results");
    };
    candidates.values().toArray();
  };

  public query ({ caller }) func getVoterList(candidateId : Nat) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view voter lists");
    };
    switch (votersByCandidateMap.get(candidateId)) {
      case (?voters) { voters };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getElectionStatus() : async { isOpen : Bool; totalVotes : Nat } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view election status");
    };
    {
      isOpen = electionOpen;
      totalVotes = votes.size();
    };
  };

  public shared ({ caller }) func setElectionOpen(open : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set election status");
    };
    electionOpen := open;
  };

  // WORK POSTS
  public type WorkPost = {
    id : Nat;
    title : Text;
    description : Text;
    author : Principal;
    timestamp : Int;
  };

  public type WorkResponse = {
    id : Nat;
    postId : Nat;
    responder : Principal;
    message : Text;
    timestamp : Int;
  };

  var nextWorkPostId : Nat = 0;
  var nextWorkResponseId : Nat = 0;
  let workPosts = Map.empty<Nat, WorkPost>();
  let workResponses = Map.empty<Nat, [WorkResponse]>();

  public shared ({ caller }) func createWorkPost(title : Text, description : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create work posts");
    };
    let id = nextWorkPostId;
    nextWorkPostId += 1;
    let post : WorkPost = {
      id;
      title;
      description;
      author = caller;
      timestamp = Time.now();
    };
    workPosts.add(id, post);
    id;
  };

  public shared ({ caller }) func respondToWorkPost(postId : Nat, message : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can respond to work posts");
    };
    switch (workPosts.get(postId)) {
      case (?_) {
        let id = nextWorkResponseId;
        nextWorkResponseId += 1;
        let response : WorkResponse = {
          id;
          postId;
          responder = caller;
          message;
          timestamp = Time.now();
        };
        let currentResponses = switch (workResponses.get(postId)) {
          case (?responses) { responses };
          case (null) { [] };
        };
        let newResponses = currentResponses.concat([response]);
        workResponses.add(postId, newResponses);
        id;
      };
      case (null) {
        Runtime.trap("Work post not found");
      };
    };
  };

  public query func getAllWorkPosts() : async [WorkPost] {
    workPosts.values().toArray();
  };

  public query func getWorkPostResponses(postId : Nat) : async [WorkResponse] {
    switch (workResponses.get(postId)) {
      case (?responses) { responses };
      case (null) { [] };
    };
  };

  // POLLS
  public type Poll = {
    id : Nat;
    question : Text;
    options : [Text];
    votes : [Nat];
    creator : Principal;
    timestamp : Int;
  };

  var nextPollId : Nat = 0;
  let polls = Map.empty<Nat, Poll>();
  let pollVotes = Map.empty<Nat, Map.Map<Principal, Nat>>();

  public shared ({ caller }) func createPoll(question : Text, options : [Text]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create polls");
    };
    let id = nextPollId;
    nextPollId += 1;
    let poll : Poll = {
      id;
      question;
      options;
      votes = Array.tabulate(options.size(), func(_) { 0 });
      creator = caller;
      timestamp = Time.now();
    };
    polls.add(id, poll);
    pollVotes.add(id, Map.empty<Principal, Nat>());
    id;
  };

  public shared ({ caller }) func voteInPoll(pollId : Nat, optionIndex : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can vote in polls");
    };
    if (optionIndex >= 10) {
      Runtime.trap("Invalid option index. Max options is 10");
    };
    switch (polls.get(pollId)) {
      case (?poll) {
        switch (pollVotes.get(pollId)) {
          case (?votesMap) {
            if (votesMap.containsKey(caller)) {
              Runtime.trap("You have already voted in this poll");
            };
            votesMap.add(caller, optionIndex);
            let newVotes = Array.tabulate(
              poll.options.size(),
              func(i) {
                if (i == optionIndex) { poll.votes[i] + 1 } else {
                  poll.votes[i];
                };
              },
            );
            let updatedPoll = {
              id = poll.id;
              question = poll.question;
              options = poll.options;
              votes = newVotes;
              creator = poll.creator;
              timestamp = poll.timestamp;
            };
            polls.add(pollId, updatedPoll);
          };
          case (null) {
            Runtime.trap("Poll votes not found");
          };
        };
      };
      case (null) {
        Runtime.trap("Poll not found");
      };
    };
  };

  // Public: anyone can view polls
  public query func getAllPolls() : async [Poll] {
    polls.values().toArray();
  };

  // PLANS
  public type Plan = {
    id : Nat;
    title : Text;
    description : Text;
    dateText : Text;
    creator : Principal;
    timestamp : Int;
  };

  var nextPlanId : Nat = 0;
  let plans = Map.empty<Nat, Plan>();

  public shared ({ caller }) func createPlan(title : Text, description : Text, dateText : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create plans");
    };
    let id = nextPlanId;
    nextPlanId += 1;
    let plan : Plan = {
      id;
      title;
      description;
      dateText;
      creator = caller;
      timestamp = Time.now();
    };
    plans.add(id, plan);
    id;
  };

  public shared ({ caller }) func deletePlan(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete plans");
    };
    switch (plans.get(id)) {
      case (?plan) {
        if (plan.creator != caller) {
          Runtime.trap("Unauthorized: Only the creator can delete this plan");
        };
        plans.remove(id);
      };
      case (null) {
        Runtime.trap("Plan not found");
      };
    };
  };

  // Public: anyone can view plans
  public query func getAllPlans() : async [Plan] {
    plans.values().toArray();
  };

  // GAME CHALLENGES
  public type GameChallenge = {
    id : Nat;
    challengerUsername : Text;
    challengedUsername : Text;
    gameName : Text;
    timestamp : Int;
  };

  var nextChallengeId : Nat = 0;
  let gameChallenges = Map.empty<Nat, GameChallenge>();

  public shared ({ caller }) func sendGameChallenge(challengerUsername : Text, challengedUsername : Text, gameName : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send game challenges");
    };
    let id = nextChallengeId;
    nextChallengeId += 1;
    let challenge : GameChallenge = {
      id;
      challengerUsername;
      challengedUsername;
      gameName;
      timestamp = Time.now();
    };
    gameChallenges.add(id, challenge);
    id;
  };

  public query ({ caller }) func getPendingChallenges(username : Text) : async [GameChallenge] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view challenges");
    };
    let all = gameChallenges.values().toArray();
    all.filter(func(challenge) { challenge.challengedUsername == username });
  };

  public shared ({ caller }) func dismissChallenge(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can dismiss challenges");
    };
    gameChallenges.remove(id);
  };
};
