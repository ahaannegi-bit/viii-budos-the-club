import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Candidate,
  LeaderboardEntry,
  NewsPost,
  NewsRequest,
  Plan,
  Poll,
  UserProfile,
  UserProfileWithRole,
  WorkPost,
  WorkResponse,
} from "../backend.d";
import { UserRole } from "../backend.d";
import { createActorWithConfig } from "../config";
import { useActor } from "./useActor";

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetNewsPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<NewsPost[]>({
    queryKey: ["newsPosts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNewsPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetNewsRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<NewsRequest[]>({
    queryKey: ["newsRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getNewsRequests() as Promise<NewsRequest[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitNewsRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requesterName,
      message,
    }: { requesterName: string; message: string }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).submitNewsRequest(
        requesterName,
        message,
      ) as Promise<void>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["newsRequests"] }),
  });
}

export function useDismissNewsRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).dismissNewsRequest(id) as Promise<void>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["newsRequests"] }),
  });
}

export function useGetLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetElectionResults() {
  const { actor, isFetching } = useActor();
  return useQuery<Candidate[]>({
    queryKey: ["electionResults"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getElectionResults();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetElectionStatus() {
  const { actor, isFetching } = useActor();
  return useQuery<{ totalVotes: bigint; isOpen: boolean }>({
    queryKey: ["electionStatus"],
    queryFn: async () => {
      if (!actor) return { totalVotes: BigInt(0), isOpen: false };
      return actor.getElectionStatus();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useHasVoted() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["hasVoted"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasVoted();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}

export function useCreateNewsPost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
      isAnnouncement,
    }: { title: string; content: string; isAnnouncement: boolean }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createNewsPost(title, content, isAnnouncement);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["newsPosts"] }),
  });
}

export function useUpdateNewsPost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      content,
    }: { id: bigint; title: string; content: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateNewsPost(id, title, content);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["newsPosts"] }),
  });
}

export function useDeleteNewsPost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteNewsPost(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["newsPosts"] }),
  });
}

export function useSetLeaderboardEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      studentName,
      scores,
    }: { studentName: string; scores: Array<[string, bigint]> }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setLeaderboardEntry(studentName, scores);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leaderboard"] }),
  });
}

export function useDeleteLeaderboardEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteLeaderboardEntry(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leaderboard"] }),
  });
}

export function useAddCandidate() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, bio }: { name: string; bio: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addCandidate(name, bio);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["electionResults"] }),
  });
}

export function useUpdateCandidate() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      bio,
    }: { id: bigint; name: string; bio: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCandidate(id, name, bio);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["electionResults"] }),
  });
}

export function useRemoveCandidate() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeCandidate(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["electionResults"] }),
  });
}

export function useCastVote() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (candidateId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.castVote(candidateId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["electionResults"] });
      qc.invalidateQueries({ queryKey: ["electionStatus"] });
      qc.invalidateQueries({ queryKey: ["hasVoted"] });
    },
  });
}

export function useSetElectionOpen() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (open: boolean) => {
      if (!actor) throw new Error("Not connected");
      return actor.setElectionOpen(open);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["electionStatus"] }),
  });
}

export function useGetVoterList(candidateId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["voterList", candidateId?.toString()],
    queryFn: async () => {
      if (!actor || candidateId === null) return [];
      return actor.getVoterList(candidateId);
    },
    enabled: !!actor && !isFetching && candidateId !== null,
  });
}

export function useGetAllUserProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfileWithRole[]>({
    queryKey: ["allUserProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllUserProfiles() as Promise<
        UserProfileWithRole[]
      >;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: { userId: Principal; role: UserRole }) => {
      if (!actor) throw new Error("Not connected");
      return actor.assignCallerUserRole(userId, role);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allUserProfiles"] }),
  });
}

// ── Work Board ──────────────────────────────────────────────────────────────

export function useGetAllWorkPosts() {
  return useQuery<WorkPost[]>({
    queryKey: ["workPosts"],
    queryFn: async () => {
      const actor = await createActorWithConfig();
      return (actor as any).getAllWorkPosts() as Promise<WorkPost[]>;
    },
    staleTime: 30_000,
  });
}

export function useCreateWorkPost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
    }: { title: string; description: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createWorkPost(title, description);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workPosts"] }),
  });
}

export function useGetWorkPostResponses(postId: bigint | null) {
  return useQuery<WorkResponse[]>({
    queryKey: ["workResponses", postId?.toString()],
    queryFn: async () => {
      if (postId === null) return [];
      const actor = await createActorWithConfig();
      return (actor as any).getWorkPostResponses(postId) as Promise<
        WorkResponse[]
      >;
    },
    enabled: postId !== null,
    staleTime: 30_000,
  });
}

export function useRespondToWorkPost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
      message,
    }: { postId: bigint; message: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.respondToWorkPost(postId, message);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["workResponses", variables.postId.toString()],
      });
    },
  });
}

// ── Polls ────────────────────────────────────────────────────────────────────

// Polls are publicly visible — fetch with anonymous actor so even logged-out users see them
export function useGetAllPolls() {
  return useQuery<Poll[]>({
    queryKey: ["polls"],
    queryFn: async () => {
      const actor = await createActorWithConfig();
      return (actor as any).getAllPolls() as Promise<Poll[]>;
    },
    staleTime: 30_000,
  });
}

export function useCreatePoll() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      question,
      options,
    }: { question: string; options: string[] }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createPoll(question, options);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["polls"] }),
  });
}

export function useVoteInPoll() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pollId,
      optionIndex,
    }: { pollId: bigint; optionIndex: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.voteInPoll(pollId, optionIndex);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["polls"] }),
  });
}

// ── Plans ────────────────────────────────────────────────────────────────────

// Plans are publicly visible — fetch with anonymous actor so even logged-out users see them
export function useGetAllPlans() {
  return useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const actor = await createActorWithConfig();
      return (actor as any).getAllPlans() as Promise<Plan[]>;
    },
    staleTime: 30_000,
  });
}

export function useCreatePlan() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      dateText,
    }: { title: string; description: string; dateText: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createPlan(title, description, dateText);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plans"] }),
  });
}

export function useDeletePlan() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deletePlan(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plans"] }),
  });
}
