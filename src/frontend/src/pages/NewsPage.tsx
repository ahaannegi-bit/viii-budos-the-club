import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  CheckCircle2,
  Loader2,
  Megaphone,
  Newspaper,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { NewsPost, UserProfile } from "../backend.d";
import {
  useCreateNewsPost,
  useDeleteNewsPost,
  useDismissNewsRequest,
  useGetNewsPosts,
  useGetNewsRequests,
  useUpdateNewsPost,
} from "../hooks/useQueries";

interface NewsPageProps {
  isAdmin: boolean;
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

function formatDateTime(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NewsPage({
  isAdmin,
  isAuthenticated,
  userProfile,
}: NewsPageProps) {
  const { data: posts, isLoading } = useGetNewsPosts();
  const { data: newsRequests } = useGetNewsRequests();
  const createPost = useCreateNewsPost();
  const updatePost = useUpdateNewsPost();
  const deletePost = useDeleteNewsPost();
  const dismissRequest = useDismissNewsRequest();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPost, setEditPost] = useState<NewsPost | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnnouncement, setIsAnnouncement] = useState(false);

  const displayPosts = posts ?? [];
  const isOwner = userProfile?.username === "mr_science1469";

  const openCreate = () => {
    setEditPost(null);
    setTitle("");
    setContent("");
    setIsAnnouncement(false);
    setDialogOpen(true);
  };

  const openEdit = (post: NewsPost) => {
    setEditPost(post);
    setTitle(post.title);
    setContent(post.content);
    setIsAnnouncement(post.isAnnouncement);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      if (editPost) {
        await updatePost.mutateAsync({ id: editPost.id, title, content });
        toast.success("Post updated!");
      } else {
        await createPost.mutateAsync({ title, content, isAnnouncement });
        toast.success("Post published!");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save post.");
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deletePost.mutateAsync(id);
      toast.success("Post deleted.");
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const handleDismiss = async (id: bigint) => {
    try {
      await dismissRequest.mutateAsync(id);
      toast.success("Request dismissed.");
    } catch {
      toast.error("Failed to dismiss.");
    }
  };

  const isPending = createPost.isPending || updatePost.isPending;
  const pendingRequestCount = newsRequests?.length ?? 0;

  const announcements = displayPosts.filter((p) => p.isAnnouncement);
  const regularPosts = displayPosts.filter((p) => !p.isAnnouncement);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Admin News Requests Inbox */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <CardTitle className="text-base font-display">
                  News Requests
                </CardTitle>
                {pendingRequestCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    {pendingRequestCount}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!newsRequests || newsRequests.length === 0 ? (
                <div
                  className="flex items-center gap-2 text-muted-foreground text-sm py-2"
                  data-ocid="news.requests.empty_state"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  No pending requests
                </div>
              ) : (
                <div className="space-y-3" data-ocid="news.requests.list">
                  <AnimatePresence>
                    {newsRequests.map((req, i) => (
                      <motion.div
                        key={req.id.toString()}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-start justify-between gap-3 p-3 rounded-lg bg-background border border-border"
                        data-ocid={`news.requests.item.${i + 1}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-foreground">
                              {req.requesterName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(req.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {req.message}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDismiss(req.id)}
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                          data-ocid={`news.requests.delete_button.${i + 1}`}
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Newspaper className="w-5 h-5 text-primary" />
            <span className="text-primary text-sm font-semibold uppercase tracking-wide">
              Club News
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground">
            BUDOS Gazette
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay in the loop with group updates and announcements
          </p>
        </div>
        {isAuthenticated && (
          <Button
            onClick={openCreate}
            className="gap-2 shrink-0"
            data-ocid="news.add.button"
          >
            <Plus className="w-4 h-4" /> New Post
          </Button>
        )}
      </div>

      {/* Pinned Website Launch Announcement */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
        data-ocid="news.launch.panel"
      >
        <Card className="border-primary/40 bg-gradient-to-r from-primary/10 to-accent/10 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-primary text-primary-foreground text-xs gap-1">
                <Megaphone className="w-3 h-3" /> Official Announcement
              </Badge>
              <Badge variant="outline" className="text-xs font-mono">
                v1.0
              </Badge>
            </div>
            <CardTitle className="font-display text-lg mt-2">
              Welcome to VIIIth A BUDOS Website!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The official VIIIth A BUDOS website is now live! Version 1.0 is
              here — you can track the leaderboard, participate in elections,
              post news, and stay updated with group news. More features coming
              soon. Welcome aboard!
            </p>
            <p className="text-xs text-muted-foreground/60 mt-3">
              — VIIIth A BUDOS Team · 2026–2027
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4" data-ocid="news.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : displayPosts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="news.empty_state"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
            <Newspaper className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            No News Yet
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xs">
            {isAuthenticated
              ? "Be the first to share something with the group!"
              : "Login to write news for the group."}
          </p>
          {isAuthenticated && (
            <Button
              onClick={openCreate}
              className="gap-2"
              data-ocid="news.create.primary_button"
            >
              <Plus className="w-4 h-4" /> Write First Post
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Announcements */}
          {announcements.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-accent" /> Announcements
              </h2>
              <div className="space-y-3">
                <AnimatePresence>
                  {announcements.map((post, i) => (
                    <motion.div
                      key={post.id.toString()}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card
                        className="border-accent/30 bg-accent/5 shadow-card"
                        data-ocid={`news.announcement.item.${i + 1}`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className="bg-accent text-accent-foreground text-xs">
                                Announcement
                              </Badge>
                              <CardTitle className="text-base font-display">
                                {post.title}
                              </CardTitle>
                            </div>
                            {isOwner && (
                              <div className="flex gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEdit(post)}
                                  className="h-7 w-7"
                                  data-ocid={`news.edit_button.${i + 1}`}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(post.id)}
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  data-ocid={`news.delete_button.${i + 1}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {post.content}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-3">
                            {formatDate(post.timestamp)}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Regular posts */}
          <div>
            <h2 className="font-display font-bold text-lg mb-3">Latest News</h2>
            {regularPosts.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="news.posts.empty_state"
              >
                <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No news posts yet.</p>
                {isAuthenticated && (
                  <p className="text-sm mt-1">
                    Click "New Post" to publish something!
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {regularPosts.map((post, i) => (
                    <motion.div
                      key={post.id.toString()}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card
                        className="shadow-card border-border"
                        data-ocid={`news.item.${i + 1}`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base font-display">
                              {post.title}
                            </CardTitle>
                            {isOwner && (
                              <div className="flex gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEdit(post)}
                                  className="h-7 w-7"
                                  data-ocid={`news.news_edit_button.${i + 1}`}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(post.id)}
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  data-ocid={`news.news_delete_button.${i + 1}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {post.content}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-3">
                            {formatDate(post.timestamp)}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="news.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editPost ? "Edit Post" : "New Post"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title..."
                data-ocid="news.title.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Content</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post..."
                rows={5}
                data-ocid="news.content.textarea"
              />
            </div>
            {!editPost && isOwner && (
              <div className="flex items-center gap-3">
                <Switch
                  id="announcement"
                  checked={isAnnouncement}
                  onCheckedChange={setIsAnnouncement}
                  data-ocid="news.announcement.switch"
                />
                <Label htmlFor="announcement">Mark as Announcement</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              data-ocid="news.cancel.button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              data-ocid="news.submit.button"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editPost ? (
                "Update"
              ) : (
                "Publish"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
