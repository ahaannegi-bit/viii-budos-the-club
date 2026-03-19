import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquare,
  Plus,
  Send,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateWorkPost,
  useGetAllUserProfiles,
  useGetAllWorkPosts,
  useGetWorkPostResponses,
  useRespondToWorkPost,
} from "../hooks/useQueries";

interface WorkPageProps {
  isAuthenticated: boolean;
}

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function WorkPostCard({
  post,
  authorName,
  isAuthenticated,
}: {
  post: {
    id: bigint;
    title: string;
    description: string;
    author: any;
    timestamp: bigint;
  };
  authorName: string;
  isAuthenticated: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [responseText, setResponseText] = useState("");
  const { data: responses, isLoading: responsesLoading } =
    useGetWorkPostResponses(expanded ? post.id : null);
  const respondMutation = useRespondToWorkPost();

  const handleRespond = async () => {
    if (!responseText.trim()) return;
    try {
      await respondMutation.mutateAsync({
        postId: post.id,
        message: responseText,
      });
      toast.success("Response sent!");
      setResponseText("");
    } catch {
      toast.error("Failed to send response.");
    }
  };

  return (
    <Card className="border-border shadow-card" data-ocid="work.item.1">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-display">
              {post.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {authorName}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(post.timestamp)}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            className="gap-1 text-xs shrink-0"
            data-ocid="work.toggle"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Responses
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {post.description}
        </p>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                {responsesLoading ? (
                  <Skeleton
                    className="h-12 rounded-lg"
                    data-ocid="work.responses.loading_state"
                  />
                ) : !responses || responses.length === 0 ? (
                  <p
                    className="text-sm text-muted-foreground text-center py-2"
                    data-ocid="work.responses.empty_state"
                  >
                    No responses yet. Be the first!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {responses.map((r, i) => (
                      <div
                        key={r.id.toString()}
                        className="p-3 rounded-lg bg-muted/40 border border-border text-sm"
                        data-ocid={`work.response.item.${i + 1}`}
                      >
                        <p className="text-foreground">{r.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(r.timestamp)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {isAuthenticated && (
                  <div className="flex gap-2">
                    <Input
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Write a response..."
                      className="flex-1 h-9"
                      data-ocid="work.response.input"
                      onKeyDown={(e) => e.key === "Enter" && handleRespond()}
                    />
                    <Button
                      size="sm"
                      onClick={handleRespond}
                      disabled={
                        respondMutation.isPending || !responseText.trim()
                      }
                      data-ocid="work.response.submit_button"
                    >
                      {respondMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default function WorkPage({ isAuthenticated }: WorkPageProps) {
  const { data: workPosts, isLoading } = useGetAllWorkPosts();
  const { data: allProfiles } = useGetAllUserProfiles();
  const createPost = useCreateWorkPost();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const profileMap = new Map(
    (allProfiles ?? []).map((p) => [p.userId.toString(), p.displayName]),
  );

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in title and description.");
      return;
    }
    try {
      await createPost.mutateAsync({ title, description });
      toast.success("Work request posted!");
      setTitle("");
      setDescription("");
    } catch {
      toast.error("Failed to post work request.");
    }
  };

  const sorted = [...(workPosts ?? [])].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <span className="text-primary text-sm font-semibold uppercase tracking-wide">
            Work Board
          </span>
        </div>
        <h1 className="font-display text-4xl font-bold text-foreground">
          Work Requests
        </h1>
        <p className="text-muted-foreground mt-1">
          Need something done? Post your request and let the group respond.
        </p>
      </motion.div>

      {/* Create post form */}
      {isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Plus className="w-4 h-4" /> Post a Work Request
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>Hey I want...</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Help with Science notes"
                  data-ocid="work.title.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Details</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you need, and respond fast..."
                  rows={3}
                  data-ocid="work.description.textarea"
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={createPost.isPending}
                className="gap-2"
                data-ocid="work.submit.primary_button"
              >
                {createPost.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Share Fast
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Posts list */}
      {isLoading ? (
        <div className="space-y-4" data-ocid="work.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
          data-ocid="work.empty_state"
        >
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            No Work Requests Yet
          </h2>
          <p className="text-muted-foreground">
            {isAuthenticated
              ? "Be the first to post a request!"
              : "Login to post a work request."}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {sorted.map((post, i) => (
              <motion.div
                key={post.id.toString()}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <WorkPostCard
                  post={post}
                  authorName={
                    profileMap.get(post.author.toString()) ?? "Member"
                  }
                  isAuthenticated={isAuthenticated}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}
