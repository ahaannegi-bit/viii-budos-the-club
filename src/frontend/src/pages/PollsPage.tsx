import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  CalendarDays,
  Loader2,
  Plus,
  Trash2,
  Vote,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";
import {
  useCreatePlan,
  useCreatePoll,
  useDeletePlan,
  useGetAllPlans,
  useGetAllPolls,
  useGetAllUserProfiles,
  useVoteInPoll,
} from "../hooks/useQueries";

interface PollsPageProps {
  isAuthenticated: boolean;
  userProfile: UserProfile | null | undefined;
}

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PollCard({
  poll,
  isAuthenticated,
}: {
  poll: {
    id: bigint;
    question: string;
    options: string[];
    votes: bigint[];
    timestamp: bigint;
  };
  isAuthenticated: boolean;
}) {
  const voteMutation = useVoteInPoll();
  const totalVotes = poll.votes.reduce((acc, v) => acc + Number(v), 0);

  const handleVote = async (index: number) => {
    if (!isAuthenticated) {
      toast.error("Login to vote!");
      return;
    }
    try {
      await voteMutation.mutateAsync({
        pollId: poll.id,
        optionIndex: BigInt(index),
      });
      toast.success("Vote cast!");
    } catch {
      toast.error("Failed to vote. You may have already voted.");
    }
  };

  return (
    <Card className="border-border shadow-card" data-ocid="polls.item.1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display">
          {poll.question}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {totalVotes} votes
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDate(poll.timestamp)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {poll.options.map((option, i) => {
          const voteCount = Number(poll.votes[i] ?? BigInt(0));
          const pct =
            totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          return (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: poll options are stable by index
              key={i}
              type="button"
              onClick={() => handleVote(i)}
              disabled={voteMutation.isPending}
              className="w-full text-left group"
              data-ocid="polls.option.button"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  {option}
                </span>
                <span className="text-xs text-muted-foreground">{pct}%</span>
              </div>
              <Progress value={pct} className="h-2" />
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function PollsPage({
  isAuthenticated,
  userProfile,
}: PollsPageProps) {
  const { data: polls, isLoading: pollsLoading } = useGetAllPolls();
  const { data: plans, isLoading: plansLoading } = useGetAllPlans();
  const { data: allProfiles } = useGetAllUserProfiles();
  const createPoll = useCreatePoll();
  const createPlan = useCreatePlan();
  const deletePlan = useDeletePlan();

  // Poll form
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["Option 1", "Option 2"]);

  // Plan form
  const [planTitle, setPlanTitle] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planDate, setPlanDate] = useState("");

  const profileMap = new Map(
    (allProfiles ?? []).map((p) => [p.userId.toString(), p.displayName]),
  );

  const handleCreatePoll = async () => {
    if (!pollQuestion.trim()) {
      toast.error("Please enter a question.");
      return;
    }
    const validOptions = pollOptions.filter((o) => o.trim());
    if (validOptions.length < 2) {
      toast.error("Please add at least 2 options.");
      return;
    }
    try {
      await createPoll.mutateAsync({
        question: pollQuestion,
        options: validOptions,
      });
      toast.success("Poll created!");
      setPollQuestion("");
      setPollOptions(["Option 1", "Option 2"]);
    } catch {
      toast.error("Failed to create poll.");
    }
  };

  const handleCreatePlan = async () => {
    if (!planTitle.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    try {
      await createPlan.mutateAsync({
        title: planTitle,
        description: planDescription,
        dateText: planDate,
      });
      toast.success("Plan created!");
      setPlanTitle("");
      setPlanDescription("");
      setPlanDate("");
    } catch {
      toast.error("Failed to create plan.");
    }
  };

  const handleDeletePlan = async (id: bigint) => {
    if (!confirm("Delete this plan?")) return;
    try {
      await deletePlan.mutateAsync(id);
      toast.success("Plan deleted.");
    } catch {
      toast.error("Failed to delete plan.");
    }
  };

  const sortedPolls = [...(polls ?? [])].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );
  const sortedPlans = [...(plans ?? [])].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );

  const myPrincipal = userProfile?.userId?.toString();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <Vote className="w-5 h-5 text-primary" />
          <span className="text-primary text-sm font-semibold uppercase tracking-wide">
            Community
          </span>
        </div>
        <h1 className="font-display text-4xl font-bold text-foreground">
          Polls &amp; Plans
        </h1>
        <p className="text-muted-foreground mt-1">
          Vote on ideas, make plans, and stay in sync with the group.
        </p>
      </motion.div>

      <Tabs defaultValue="polls" data-ocid="polls.tab">
        <TabsList className="mb-6 w-full">
          <TabsTrigger
            value="polls"
            className="flex-1 gap-2"
            data-ocid="polls.polls.tab"
          >
            <Vote className="w-4 h-4" /> Polls
          </TabsTrigger>
          <TabsTrigger
            value="plans"
            className="flex-1 gap-2"
            data-ocid="polls.plans.tab"
          >
            <CalendarDays className="w-4 h-4" /> Plans
          </TabsTrigger>
        </TabsList>

        {/* POLLS TAB */}
        <TabsContent value="polls" className="space-y-6">
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create a Poll
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Question</Label>
                    <Input
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      placeholder="What do you want to ask?"
                      data-ocid="polls.question.input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Options</Label>
                    {pollOptions.map((opt, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: poll options are positional
                      <div key={i} className="flex gap-2">
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const updated = [...pollOptions];
                            updated[i] = e.target.value;
                            setPollOptions(updated);
                          }}
                          placeholder={`Option ${i + 1}`}
                          data-ocid="polls.option.input"
                        />
                        {pollOptions.length > 2 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setPollOptions(
                                pollOptions.filter((_, j) => j !== i),
                              )
                            }
                            className="shrink-0 h-9 w-9"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {pollOptions.length < 4 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPollOptions([...pollOptions, ""])}
                        className="gap-2"
                        data-ocid="polls.add_option.button"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Option
                      </Button>
                    )}
                  </div>
                  <Button
                    onClick={handleCreatePoll}
                    disabled={createPoll.isPending}
                    className="gap-2"
                    data-ocid="polls.create.primary_button"
                  >
                    {createPoll.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Vote className="w-4 h-4" />
                    )}
                    Create Poll
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {pollsLoading ? (
            <div className="space-y-4" data-ocid="polls.loading_state">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </div>
          ) : sortedPolls.length === 0 ? (
            <div className="text-center py-16" data-ocid="polls.empty_state">
              <Vote className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="font-display text-xl font-bold">No Polls Yet</p>
              <p className="text-muted-foreground mt-1">
                {isAuthenticated
                  ? "Create the first poll!"
                  : "Login to create polls."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {sortedPolls.map((poll, i) => (
                  <motion.div
                    key={poll.id.toString()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <PollCard poll={poll} isAuthenticated={isAuthenticated} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* PLANS TAB */}
        <TabsContent value="plans" className="space-y-6">
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create a Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Plan Title</Label>
                    <Input
                      value={planTitle}
                      onChange={(e) => setPlanTitle(e.target.value)}
                      placeholder="e.g. Group Study at Library"
                      data-ocid="polls.plan_title.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Textarea
                      value={planDescription}
                      onChange={(e) => setPlanDescription(e.target.value)}
                      placeholder="What's the plan? Who's in, what to bring..."
                      rows={2}
                      data-ocid="polls.plan_description.textarea"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date / Time</Label>
                    <Input
                      value={planDate}
                      onChange={(e) => setPlanDate(e.target.value)}
                      placeholder="e.g. Saturday, March 21 at 4pm"
                      data-ocid="polls.plan_date.input"
                    />
                  </div>
                  <Button
                    onClick={handleCreatePlan}
                    disabled={createPlan.isPending}
                    className="gap-2"
                    data-ocid="polls.plan.primary_button"
                  >
                    {createPlan.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                    Add Plan
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {plansLoading ? (
            <div className="space-y-4" data-ocid="polls.plans.loading_state">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : sortedPlans.length === 0 ? (
            <div
              className="text-center py-16"
              data-ocid="polls.plans.empty_state"
            >
              <CalendarDays className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="font-display text-xl font-bold">No Plans Yet</p>
              <p className="text-muted-foreground mt-1">
                {isAuthenticated
                  ? "Create the first group plan!"
                  : "Login to create plans."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {sortedPlans.map((plan, i) => (
                  <motion.div
                    key={plan.id.toString()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card
                      className="border-border shadow-card"
                      data-ocid={`polls.plans.item.${i + 1}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-base font-display">
                              {plan.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {plan.dateText && (
                                <Badge
                                  variant="outline"
                                  className="text-xs gap-1"
                                >
                                  <CalendarDays className="w-3 h-3" />
                                  {plan.dateText}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                by{" "}
                                {profileMap.get(plan.creator.toString()) ??
                                  "Member"}
                              </span>
                            </div>
                          </div>
                          {myPrincipal &&
                            plan.creator.toString() === myPrincipal && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePlan(plan.id)}
                                className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                                data-ocid={`polls.plans.delete_button.${i + 1}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                        </div>
                      </CardHeader>
                      {plan.description && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {plan.description}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
