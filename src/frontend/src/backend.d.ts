import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface NewsPost {
    id: bigint;
    title: string;
    content: string;
    isAnnouncement: boolean;
    author: Principal;
    timestamp: bigint;
}
export interface Plan {
    id: bigint;
    title: string;
    creator: Principal;
    description: string;
    timestamp: bigint;
    dateText: string;
}
export interface WorkPost {
    id: bigint;
    title: string;
    description: string;
    author: Principal;
    timestamp: bigint;
}
export interface WorkResponse {
    id: bigint;
    responder: Principal;
    message: string;
    timestamp: bigint;
    postId: bigint;
}
export interface NewsRequest {
    id: bigint;
    requester: Principal;
    message: string;
    timestamp: bigint;
    requesterName: string;
}
export interface LeaderboardEntry {
    id: bigint;
    studentName: string;
    scores: Array<[string, bigint]>;
    rank: bigint;
    totalScore: bigint;
}
export interface GameChallenge {
    id: bigint;
    challengerUsername: string;
    challengedUsername: string;
    timestamp: bigint;
    gameName: string;
}
export interface Candidate {
    id: bigint;
    bio: string;
    voteCount: bigint;
    name: string;
    photo?: string;
}
export interface Poll {
    id: bigint;
    creator: Principal;
    question: string;
    votes: Array<bigint>;
    timestamp: bigint;
    options: Array<string>;
}
export interface UserProfile {
    username: string;
    displayName: string;
    userId: Principal;
}
export interface UserProfileWithRole {
    username: string;
    displayName: string;
    userId: Principal;
    role: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCandidate(name: string, bio: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    castVote(candidateId: bigint): Promise<void>;
    createNewsPost(title: string, content: string, isAnnouncement: boolean): Promise<bigint>;
    createPlan(title: string, description: string, dateText: string): Promise<bigint>;
    createPoll(question: string, options: Array<string>): Promise<bigint>;
    createWorkPost(title: string, description: string): Promise<bigint>;
    deleteLeaderboardEntry(id: bigint): Promise<void>;
    deleteNewsPost(id: bigint): Promise<void>;
    deletePlan(id: bigint): Promise<void>;
    dismissChallenge(id: bigint): Promise<void>;
    dismissNewsRequest(id: bigint): Promise<void>;
    getAllPlans(): Promise<Array<Plan>>;
    getAllPolls(): Promise<Array<Poll>>;
    getAllUserProfiles(): Promise<Array<UserProfileWithRole>>;
    getAllWorkPosts(): Promise<Array<WorkPost>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getElectionResults(): Promise<Array<Candidate>>;
    getElectionStatus(): Promise<{
        totalVotes: bigint;
        isOpen: boolean;
    }>;
    getLeaderboard(): Promise<Array<LeaderboardEntry>>;
    getNewsPosts(): Promise<Array<NewsPost>>;
    getNewsRequests(): Promise<Array<NewsRequest>>;
    getPendingChallenges(username: string): Promise<Array<GameChallenge>>;
    getUserProfile(userId: Principal): Promise<UserProfile | null>;
    getVoterList(candidateId: bigint): Promise<Array<Principal>>;
    getWorkPostResponses(postId: bigint): Promise<Array<WorkResponse>>;
    hasVoted(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    removeCandidate(id: bigint): Promise<void>;
    respondToWorkPost(postId: bigint, message: string): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendGameChallenge(challengerUsername: string, challengedUsername: string, gameName: string): Promise<bigint>;
    setElectionOpen(open: boolean): Promise<void>;
    setLeaderboardEntry(studentName: string, scores: Array<[string, bigint]>): Promise<void>;
    submitNewsRequest(requesterName: string, message: string): Promise<void>;
    updateCandidate(id: bigint, name: string, bio: string): Promise<void>;
    updateDisplayName(name: string): Promise<void>;
    updateNewsPost(id: bigint, title: string, content: string): Promise<void>;
    voteInPoll(pollId: bigint, optionIndex: bigint): Promise<void>;
}
