import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Clock,
  Loader2,
  Pencil,
  Plus,
  Star,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { LeaderboardEntry } from "../backend.d";
import {
  useDeleteLeaderboardEntry,
  useGetLeaderboard,
  useSetLeaderboardEntry,
} from "../hooks/useQueries";

interface LeaderboardPageProps {
  isAdmin: boolean;
}

const sampleEntries: LeaderboardEntry[] = [
  {
    id: BigInt(1),
    studentName: "Member 1",
    rank: BigInt(1),
    totalScore: BigInt(476),
    scores: [["Score", BigInt(476)]],
  },
  {
    id: BigInt(2),
    studentName: "Member 2",
    rank: BigInt(2),
    totalScore: BigInt(461),
    scores: [["Score", BigInt(461)]],
  },
  {
    id: BigInt(3),
    studentName: "Member 3",
    rank: BigInt(3),
    totalScore: BigInt(445),
    scores: [["Score", BigInt(445)]],
  },
  {
    id: BigInt(4),
    studentName: "Member 4",
    rank: BigInt(4),
    totalScore: BigInt(430),
    scores: [["Score", BigInt(430)]],
  },
  {
    id: BigInt(5),
    studentName: "Member 5",
    rank: BigInt(5),
    totalScore: BigInt(415),
    scores: [["Score", BigInt(415)]],
  },
  {
    id: BigInt(6),
    studentName: "Member 6",
    rank: BigInt(6),
    totalScore: BigInt(398),
    scores: [["Score", BigInt(398)]],
  },
  {
    id: BigInt(7),
    studentName: "Member 7",
    rank: BigInt(7),
    totalScore: BigInt(380),
    scores: [["Score", BigInt(380)]],
  },
  {
    id: BigInt(8),
    studentName: "Member 8",
    rank: BigInt(8),
    totalScore: BigInt(360),
    scores: [["Score", BigInt(360)]],
  },
];

const medalColors = ["text-yellow-500", "text-slate-400", "text-amber-600"];

function getSubjectChampions(entries: LeaderboardEntry[]) {
  const champs: Record<string, { name: string; score: number }> = {};
  for (const entry of entries) {
    for (const [subject, score] of entry.scores) {
      const s = Number(score);
      if (!champs[subject] || s > champs[subject].score) {
        champs[subject] = { name: entry.studentName, score: s };
      }
    }
  }
  return champs;
}

export default function LeaderboardPage({ isAdmin }: LeaderboardPageProps) {
  const { data: entries, isLoading } = useGetLeaderboard();
  const setEntry = useSetLeaderboardEntry();
  const deleteEntry = useDeleteLeaderboardEntry();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [subjects, setSubjects] = useState<[string, string][]>([["Score", ""]]);

  const displayEntries =
    entries && entries.length > 0 ? entries : sampleEntries;
  const champions = getSubjectChampions(displayEntries);

  const openAddDialog = () => {
    setEditingName(null);
    setStudentName("");
    setSubjects([["Score", ""]]);
    setDialogOpen(true);
  };

  const openEditDialog = (entry: LeaderboardEntry) => {
    setEditingName(entry.studentName);
    setStudentName(entry.studentName);
    setSubjects(
      entry.scores.map(
        ([subj, score]) => [subj, score.toString()] as [string, string],
      ),
    );
    setDialogOpen(true);
  };

  const addSubject = () => setSubjects((prev) => [...prev, ["", ""]]);
  const removeSubject = (i: number) =>
    setSubjects((prev) => prev.filter((_, idx) => idx !== i));
  const updateSubject = (i: number, field: 0 | 1, value: string) => {
    setSubjects((prev) => {
      const next = [...prev] as [string, string][];
      next[i] = [...next[i]] as [string, string];
      next[i][field] = value;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!studentName.trim()) {
      toast.error("Enter a member name.");
      return;
    }
    const scores: [string, bigint][] = subjects
      .filter(([subj, score]) => subj.trim() && score.trim())
      .map(
        ([subj, score]) =>
          [subj.trim(), BigInt(Math.round(Number(score)))] as [string, bigint],
      );
    if (scores.length === 0) {
      toast.error("Add at least one score.");
      return;
    }
    try {
      // When editing, use the original name so backend upserts by name
      const nameToSave = editingName ?? studentName.trim();
      await setEntry.mutateAsync({ studentName: nameToSave, scores });
      toast.success(editingName ? "Entry updated!" : "Entry saved!");
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save entry.");
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Remove this entry?")) return;
    try {
      await deleteEntry.mutateAsync(id);
      toast.success("Entry removed.");
    } catch {
      toast.error("Failed to remove.");
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-accent" />
            <span className="text-accent text-sm font-semibold uppercase tracking-wide">
              Rankings
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground">
            Top Scorers
          </h1>
          <p className="text-muted-foreground mt-1">
            Leaderboard for VIIIth A BUDOS — 8 members
          </p>
          <p className="text-muted-foreground text-sm mt-0.5 italic">
            Top Score of Last Term
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={openAddDialog}
            className="gap-2 shrink-0"
            data-ocid="leaderboard.add.button"
          >
            <Plus className="w-4 h-4" /> Add Entry
          </Button>
        )}
      </div>

      {/* Final Result Incoming Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 flex items-center gap-3 rounded-xl border border-amber-400/60 bg-amber-50 px-4 py-3 shadow-sm dark:bg-amber-950/30 dark:border-amber-500/40"
        data-ocid="leaderboard.section"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/20">
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </span>
        <div>
          <p className="font-display font-bold text-amber-800 dark:text-amber-300 text-sm sm:text-base">
            Final Result Incoming
          </p>
          <p className="text-amber-700 dark:text-amber-400/80 text-xs mt-0.5">
            Official final rankings will be published soon. Scores shown are
            provisional.
          </p>
        </div>
        <AlertTriangle className="ml-auto h-4 w-4 shrink-0 text-amber-500" />
      </motion.div>

      {/* Subject Champions */}
      {Object.keys(champions).length > 1 && (
        <div className="mb-8">
          <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" /> Subject Champions
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(champions).map(([subj, { name, score }]) => (
              <Badge
                key={subj}
                variant="secondary"
                className="gap-1.5 px-3 py-1 text-sm"
              >
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="font-semibold">{subj}:</span> {name} ({score})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <Skeleton
          className="h-64 rounded-xl"
          data-ocid="leaderboard.loading_state"
        />
      ) : displayEntries.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="leaderboard.empty_state"
        >
          <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p>No entries yet.</p>
        </div>
      ) : (
        <Card
          className="shadow-card overflow-hidden"
          data-ocid="leaderboard.table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-14 font-display font-bold">
                  Rank
                </TableHead>
                <TableHead className="font-display font-bold">Member</TableHead>
                <TableHead className="font-display font-bold">Scores</TableHead>
                <TableHead className="font-display font-bold text-right">
                  Total
                </TableHead>
                {isAdmin && <TableHead className="w-20" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayEntries.map((entry, i) => (
                <motion.tr
                  key={entry.id.toString()}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                  data-ocid={`leaderboard.row.${i + 1}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {i < 3 ? (
                        <Trophy className={`w-4 h-4 ${medalColors[i]}`} />
                      ) : null}
                      <span
                        className={`font-display font-bold text-sm ${i < 3 ? medalColors[i] : "text-muted-foreground"}`}
                      >
                        #{i + 1}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-display font-semibold">
                    {entry.studentName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {entry.scores.map(([subj, score]) => (
                        <Badge
                          key={subj}
                          variant="outline"
                          className="text-xs px-1.5 py-0"
                        >
                          {subj}: {score.toString()}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-display font-bold text-primary">
                      {entry.totalScore.toString()}
                    </span>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => openEditDialog(entry)}
                          data-ocid={`leaderboard.edit_button.${i + 1}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(entry.id)}
                          data-ocid={`leaderboard.delete_button.${i + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add / Edit Entry Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="leaderboard.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingName ? "Edit Entry" : "Add / Update Entry"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Member Name</Label>
              <Input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Alex"
                disabled={!!editingName}
                data-ocid="leaderboard.name.input"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Scores</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addSubject}
                  className="h-7 text-xs gap-1"
                  data-ocid="leaderboard.add_subject.button"
                >
                  <Plus className="w-3 h-3" /> Add Category
                </Button>
              </div>
              <div className="space-y-2">
                {subjects.map((pair, i) => (
                  <div
                    key={`subj-${pair[0]}-${i}`}
                    className="flex gap-2 items-center"
                  >
                    <Input
                      placeholder="Category"
                      value={pair[0]}
                      onChange={(e) => updateSubject(i, 0, e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Score"
                      type="number"
                      min={0}
                      value={pair[1]}
                      onChange={(e) => updateSubject(i, 1, e.target.value)}
                      className="w-24"
                    />
                    {subjects.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 text-muted-foreground"
                        onClick={() => removeSubject(i)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              data-ocid="leaderboard.cancel.button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={setEntry.isPending}
              data-ocid="leaderboard.submit.button"
            >
              {setEntry.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingName ? (
                "Update Entry"
              ) : (
                "Save Entry"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
