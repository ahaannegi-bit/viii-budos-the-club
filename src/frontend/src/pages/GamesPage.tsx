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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useGetAllUserProfiles } from "../hooks/useQueries";

type GameId =
  | "chess"
  | "dotsboxes"
  | "battleship"
  | "maths"
  | "stickman"
  | null;

interface GamesPageProps {
  isAuthenticated: boolean;
  userProfile: UserProfile | null | undefined;
}

// ─── Game Hub ────────────────────────────────────────────────────────────────

export default function GamesPage({
  isAuthenticated,
  userProfile,
}: GamesPageProps) {
  const [activeGame, setActiveGame] = useState<GameId>(null);

  const games = [
    {
      id: "chess" as GameId,
      title: "Chess",
      desc: "Classic chess vs computer AI. All standard rules apply.",
      emoji: "♟️",
      color: "from-slate-700 to-slate-900",
    },
    {
      id: "dotsboxes" as GameId,
      title: "Dots & Boxes",
      desc: "Connect dots to claim boxes. Outsmart the AI!",
      emoji: "🟦",
      color: "from-blue-600 to-indigo-800",
    },
    {
      id: "battleship" as GameId,
      title: "Battleship",
      desc: "Sink the enemy fleet on a 10×10 grid.",
      emoji: "🚢",
      color: "from-teal-600 to-cyan-900",
    },
    {
      id: "maths" as GameId,
      title: "Mental Maths Duel",
      desc: "25 questions. Beat the computer in a race!",
      emoji: "🧮",
      color: "from-orange-500 to-red-700",
    },
    {
      id: "stickman" as GameId,
      title: "Stickman Slap Duel",
      desc: "React fast, slap hard. Win and get rickrolled!",
      emoji: "👋",
      color: "from-pink-500 to-purple-700",
    },
  ];

  if (activeGame) {
    const props = {
      onBack: () => setActiveGame(null),
      isAuthenticated,
      userProfile,
    };
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeGame}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeGame === "chess" && <ChessGame {...props} />}
          {activeGame === "dotsboxes" && <DotsBoxesGame {...props} />}
          {activeGame === "battleship" && <BattleshipGame {...props} />}
          {activeGame === "maths" && <MathsDuelGame {...props} />}
          {activeGame === "stickman" && <StickmanGame {...props} />}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <span className="text-accent text-sm font-semibold uppercase tracking-wide">
            🎮 Games
          </span>
          <h1 className="font-display text-4xl font-bold text-foreground mt-1">
            Games Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Pick a game and challenge the computer. Login required to play.
          </p>
        </div>
        {!isAuthenticated && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 text-amber-800 dark:text-amber-200">
            ⚠️ You need to be logged in to play games.
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border-0 group"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error("Please log in to play games!");
                    return;
                  }
                  setActiveGame(g.id);
                }}
                data-ocid="games.item"
              >
                <div
                  className={`h-28 bg-gradient-to-br ${g.color} flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300`}
                >
                  {g.emoji}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-display">
                    {g.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{g.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}

// ─── Shared game props ───────────────────────────────────────────────────────

interface GameProps {
  onBack: () => void;
  isAuthenticated: boolean;
  userProfile: UserProfile | null | undefined;
}

function GameShell({
  title,
  emoji,
  onBack,
  onReset,
  userProfile,
  children,
}: {
  title: string;
  emoji: string;
  onBack: () => void;
  onReset: () => void;
  userProfile: UserProfile | null | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          data-ocid="games.back.button"
        >
          ← Back
        </Button>
        <h2 className="font-display text-2xl font-bold">
          {emoji} {title}
        </h2>
        <div className="ml-auto flex gap-2">
          <ChallengeFriendButton gameName={title} userProfile={userProfile} />
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            data-ocid="games.reset.button"
          >
            🔄 New Game
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Challenge Friend Button ─────────────────────────────────────────────────

function ChallengeFriendButton({
  gameName,
  userProfile,
}: { gameName: string; userProfile: UserProfile | null | undefined }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const { data: profiles } = useGetAllUserProfiles();
  const { actor } = useActor();

  const handleChallenge = async () => {
    if (!userProfile || !selected || !actor) return;
    try {
      await (actor as any).sendGameChallenge(
        userProfile.username,
        selected,
        gameName,
      );
      toast.success(`Challenge sent to ${selected}!`);
      setOpen(false);
    } catch {
      toast.error("Failed to send challenge.");
    }
  };

  if (!userProfile) return null;

  const others = (profiles || []).filter(
    (p) => p.username !== userProfile.username,
  );

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        data-ocid="games.challenge.button"
      >
        🤝 Challenge
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="games.challenge.dialog">
          <DialogHeader>
            <DialogTitle>Challenge a Friend — {gameName}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger data-ocid="games.challenge.select">
                <SelectValue placeholder="Pick a member..." />
              </SelectTrigger>
              <SelectContent>
                {others.map((p) => (
                  <SelectItem key={p.username} value={p.username}>
                    {p.displayName} (@{p.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="games.challenge.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleChallenge}
              disabled={!selected}
              data-ocid="games.challenge.confirm_button"
            >
              Send Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAME 1: CHESS
// ═══════════════════════════════════════════════════════════════════════════════

type PieceType = "K" | "Q" | "R" | "B" | "N" | "P";
type Color = "w" | "b";
type Piece = { type: PieceType; color: Color } | null;
type Board = Piece[][];

const UNICODE: Record<Color, Record<PieceType, string>> = {
  w: { K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙" },
  b: { K: "♚", Q: "♛", R: "♜", B: "♝", N: "♞", P: "♟" },
};

function makeInitialBoard(): Board {
  const b: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));
  const backRow: PieceType[] = ["R", "N", "B", "Q", "K", "B", "N", "R"];
  for (let c = 0; c < 8; c++) {
    b[0][c] = { type: backRow[c], color: "b" };
    b[1][c] = { type: "P", color: "b" };
    b[6][c] = { type: "P", color: "w" };
    b[7][c] = { type: backRow[c], color: "w" };
  }
  return b;
}

function cloneBoard(b: Board): Board {
  return b.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function isInBounds(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function getLegalMoves(
  board: Board,
  r: number,
  c: number,
  enPassantTarget: [number, number] | null,
): [number, number][] {
  const piece = board[r][c];
  if (!piece) return [];
  const moves: [number, number][] = [];
  const { type, color } = piece;
  const enemy = color === "w" ? "b" : "w";

  const slide = (dr: number, dc: number) => {
    let nr = r + dr;
    let nc = c + dc;
    while (isInBounds(nr, nc)) {
      if (!board[nr][nc]) {
        moves.push([nr, nc]);
      } else {
        if (board[nr][nc]!.color === enemy) moves.push([nr, nc]);
        break;
      }
      nr += dr;
      nc += dc;
    }
  };

  if (type === "P") {
    const dir = color === "w" ? -1 : 1;
    const startRow = color === "w" ? 6 : 1;
    if (isInBounds(r + dir, c) && !board[r + dir][c]) {
      moves.push([r + dir, c]);
      if (r === startRow && !board[r + 2 * dir][c])
        moves.push([r + 2 * dir, c]);
    }
    for (const dc of [-1, 1]) {
      const nr = r + dir;
      const nc = c + dc;
      if (isInBounds(nr, nc)) {
        if (board[nr][nc]?.color === enemy) moves.push([nr, nc]);
        if (
          enPassantTarget &&
          enPassantTarget[0] === nr &&
          enPassantTarget[1] === nc
        )
          moves.push([nr, nc]);
      }
    }
  } else if (type === "N") {
    for (const [dr, dc] of [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ]) {
      const nr = r + dr;
      const nc = c + dc;
      if (isInBounds(nr, nc) && board[nr][nc]?.color !== color)
        moves.push([nr, nc]);
    }
  } else if (type === "B") {
    for (const [dr, dc] of [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ])
      slide(dr, dc);
  } else if (type === "R") {
    for (const [dr, dc] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ])
      slide(dr, dc);
  } else if (type === "Q") {
    for (const d of [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ])
      slide(d[0], d[1]);
  } else if (type === "K") {
    for (const [dr, dc] of [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ]) {
      const nr = r + dr;
      const nc = c + dc;
      if (isInBounds(nr, nc) && board[nr][nc]?.color !== color)
        moves.push([nr, nc]);
    }
  }
  return moves;
}

function isKingInCheck(
  board: Board,
  color: Color,
  ep: [number, number] | null,
): boolean {
  let kr = -1;
  let kc = -1;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.type === "K" && board[r][c]?.color === color) {
        kr = r;
        kc = c;
      }
  const enemy = color === "w" ? "b" : "w";
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.color === enemy) {
        const moves = getLegalMoves(board, r, c, ep);
        if (moves.some(([mr, mc]) => mr === kr && mc === kc)) return true;
      }
  return false;
}

function applyMove(
  board: Board,
  from: [number, number],
  to: [number, number],
  ep: [number, number] | null,
): { board: Board; newEp: [number, number] | null } {
  const nb = cloneBoard(board);
  const [fr, fc] = from;
  const [tr, tc] = to;
  const piece = nb[fr][fc]!;
  // en passant capture
  if (piece.type === "P" && ep && ep[0] === tr && ep[1] === tc) {
    const capR = fr;
    nb[capR][tc] = null;
  }
  nb[tr][tc] = piece;
  nb[fr][fc] = null;
  // pawn promotion
  if (piece.type === "P" && (tr === 0 || tr === 7))
    nb[tr][tc] = { type: "Q", color: piece.color };
  // set en passant
  let newEp: [number, number] | null = null;
  if (piece.type === "P" && Math.abs(tr - fr) === 2)
    newEp = [(fr + tr) / 2, fc];
  return { board: nb, newEp };
}

function getValidMovesForColor(
  board: Board,
  color: Color,
  ep: [number, number] | null,
): { from: [number, number]; to: [number, number] }[] {
  const all: { from: [number, number]; to: [number, number] }[] = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.color === color) {
        const moves = getLegalMoves(board, r, c, ep);
        for (const to of moves) {
          const { board: nb } = applyMove(board, [r, c], to, ep);
          if (!isKingInCheck(nb, color, null)) all.push({ from: [r, c], to });
        }
      }
  return all;
}

function ChessGame({ onBack, userProfile }: GameProps) {
  const [board, setBoard] = useState<Board>(makeInitialBoard);
  const [turn, setTurn] = useState<Color>("w");
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [ep, setEp] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState<
    "playing" | "check" | "checkmate" | "stalemate"
  >("playing");
  const [captured, setCaptured] = useState<{ w: Piece[]; b: Piece[] }>({
    w: [],
    b: [],
  });

  const reset = useCallback(() => {
    setBoard(makeInitialBoard());
    setTurn("w");
    setSelected(null);
    setValidMoves([]);
    setEp(null);
    setStatus("playing");
    setCaptured({ w: [], b: [] });
  }, []);

  const handleClick = useCallback(
    (r: number, c: number) => {
      if (turn !== "w" || (status !== "playing" && status !== "check")) return;
      const piece = board[r][c];

      if (selected) {
        const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c);
        if (isValid) {
          const cap = board[r][c];
          const { board: nb, newEp } = applyMove(board, selected, [r, c], ep);
          if (!isKingInCheck(nb, "w", newEp)) {
            const newCaptured = { ...captured };
            if (cap) newCaptured.b = [...newCaptured.b, cap];
            setCaptured(newCaptured);
            setBoard(nb);
            setEp(newEp);
            setSelected(null);
            setValidMoves([]);
            setTurn("b");
          } else {
            toast.error("That move leaves your king in check!");
          }
          return;
        }
        setSelected(null);
        setValidMoves([]);
      }

      if (piece?.color === "w") {
        const moves = getLegalMoves(board, r, c, ep).filter((to) => {
          const { board: nb } = applyMove(board, [r, c], to, ep);
          return !isKingInCheck(nb, "w", null);
        });
        setSelected([r, c]);
        setValidMoves(moves);
      }
    },
    [board, turn, selected, validMoves, ep, status, captured],
  );

  // AI move
  useEffect(() => {
    if (turn !== "b" || (status !== "playing" && status !== "check")) return;
    const timer = setTimeout(() => {
      const moves = getValidMovesForColor(board, "b", ep);
      if (moves.length === 0) {
        setStatus(isKingInCheck(board, "b", ep) ? "checkmate" : "stalemate");
        return;
      }
      const { from, to } = moves[Math.floor(Math.random() * moves.length)];
      const cap = board[to[0]][to[1]];
      const { board: nb, newEp } = applyMove(board, from, to, ep);
      const newCaptured = { ...captured };
      if (cap) newCaptured.w = [...newCaptured.w, cap];
      setCaptured(newCaptured);
      setBoard(nb);
      setEp(newEp);
      setTurn("w");
      // Check state for white
      const wMoves = getValidMovesForColor(nb, "w", newEp);
      if (wMoves.length === 0) {
        setStatus(isKingInCheck(nb, "w", newEp) ? "checkmate" : "stalemate");
      } else if (isKingInCheck(nb, "w", newEp)) {
        setStatus("check");
      } else {
        setStatus("playing");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [turn, board, ep, captured, status]);

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

  return (
    <GameShell
      title="Chess"
      emoji="♟️"
      onBack={onBack}
      onReset={reset}
      userProfile={userProfile}
    >
      <div className="flex flex-col items-center gap-4">
        {status === "checkmate" && (
          <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-lg px-6 py-3 font-bold text-lg">
            Checkmate! {turn === "b" ? "You win! 🎉" : "Computer wins! 🤖"}
          </div>
        )}
        {status === "stalemate" && (
          <div className="bg-muted border rounded-lg px-6 py-3 font-bold text-lg">
            Stalemate! Draw.
          </div>
        )}
        {status === "check" && (
          <div className="bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 border border-amber-300 rounded-lg px-4 py-2">
            ⚠️ Your king is in check!
          </div>
        )}
        <div className="flex items-center gap-4 text-sm">
          <Badge variant={turn === "w" ? "default" : "secondary"}>
            {turn === "w" ? "⬜ Your turn" : "⬛ Computer thinking..."}
          </Badge>
          <span className="text-muted-foreground">
            Captured:{" "}
            {captured.b
              .map((p) => (p ? UNICODE[p.color][p.type] : ""))
              .join("")}
          </span>
        </div>
        <div className="border-2 border-border rounded-lg overflow-hidden shadow-lg">
          {([0, 1, 2, 3, 4, 5, 6, 7] as const).map((r) => (
            <div key={`row-${r}`} className="flex">
              <div className="w-6 flex items-center justify-center text-xs text-muted-foreground font-mono">
                {8 - r}
              </div>
              {([0, 1, 2, 3, 4, 5, 6, 7] as const).map((c) => {
                const cell = board[r][c];
                const isLight = (r + c) % 2 === 0;
                const isSel = selected?.[0] === r && selected?.[1] === c;
                const isValid = validMoves.some(
                  ([vr, vc]) => vr === r && vc === c,
                );
                return (
                  <button
                    type="button"
                    key={`cell-${r}-${c}`}
                    onClick={() => handleClick(r, c)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-2xl sm:text-3xl cursor-pointer transition-colors
                      ${isLight ? "bg-amber-100" : "bg-amber-800"}
                      ${isSel ? "ring-2 ring-inset ring-yellow-400" : ""}
                      ${isValid ? "ring-2 ring-inset ring-green-400" : ""}
                    `}
                  >
                    {cell ? (
                      UNICODE[cell.color][cell.type]
                    ) : isValid ? (
                      <span className="w-3 h-3 rounded-full bg-green-400/60 block" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
          <div className="flex ml-6">
            {files.map((f) => (
              <div
                key={f}
                className="w-10 sm:w-12 text-center text-xs text-muted-foreground font-mono"
              >
                {f}
              </div>
            ))}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Computer captured:{" "}
          {captured.w.map((p) => (p ? UNICODE[p.color][p.type] : "")).join("")}
        </div>
      </div>
    </GameShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAME 2: DOTS & BOXES
// ═══════════════════════════════════════════════════════════════════════════════

type EdgeKey = string; // "h-r-c" or "v-r-c"

const DB_ROWS = 4;
const DB_COLS = 4;

function getAllEdges(): EdgeKey[] {
  const all: EdgeKey[] = [];
  for (let r = 0; r <= DB_ROWS; r++)
    for (let c = 0; c < DB_COLS; c++) all.push(`h-${r}-${c}`);
  for (let r = 0; r < DB_ROWS; r++)
    for (let c = 0; c <= DB_COLS; c++) all.push(`v-${r}-${c}`);
  return all;
}

function findCompletingEdge(edges: Set<EdgeKey>): EdgeKey | null {
  for (let r = 0; r < DB_ROWS; r++) {
    for (let c = 0; c < DB_COLS; c++) {
      const sides = [
        `h-${r}-${c}`,
        `h-${r + 1}-${c}`,
        `v-${r}-${c}`,
        `v-${r}-${c + 1}`,
      ];
      const filled = sides.filter((s) => edges.has(s));
      if (filled.length === 3) {
        const missing = sides.find((s) => !edges.has(s));
        if (missing) return missing;
      }
    }
  }
  return null;
}

function DotsBoxesGame({ onBack, userProfile }: GameProps) {
  const ROWS = DB_ROWS;
  const COLS = DB_COLS;

  const [edges, setEdges] = useState<Set<EdgeKey>>(new Set());
  const [boxes, setBoxes] = useState<("player" | "ai" | null)[][]>(
    Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(null)),
  );
  const [turn, setTurn] = useState<"player" | "ai">("player");
  const [scores, setScores] = useState({ player: 0, ai: 0 });
  const [gameOver, setGameOver] = useState(false);

  const checkBoxes = useCallback(
    (e: Set<EdgeKey>, turn: "player" | "ai") => {
      const newBoxes = boxes.map((row) => [...row]);
      let scored = 0;
      for (let r = 0; r < DB_ROWS; r++) {
        for (let c = 0; c < DB_COLS; c++) {
          if (newBoxes[r][c] !== null) continue;
          const top = e.has(`h-${r}-${c}`);
          const bottom = e.has(`h-${r + 1}-${c}`);
          const left = e.has(`v-${r}-${c}`);
          const right = e.has(`v-${r}-${c + 1}`);
          if (top && bottom && left && right) {
            newBoxes[r][c] = turn;
            scored++;
          }
        }
      }
      setBoxes(newBoxes);
      return scored;
    },
    [boxes],
  );

  const clickEdge = useCallback(
    (key: EdgeKey) => {
      if (turn !== "player" || edges.has(key) || gameOver) return;
      const ne = new Set(edges);
      ne.add(key);
      const scored = checkBoxes(ne, "player");
      setEdges(ne);
      const newScore = { ...scores, player: scores.player + scored };
      setScores(newScore);
      const totalBoxes = DB_ROWS * DB_COLS;
      if (newScore.player + newScore.ai === totalBoxes) {
        setGameOver(true);
        return;
      }
      if (scored === 0) setTurn("ai");
    },
    [edges, turn, gameOver, scores, checkBoxes],
  );

  // AI turn
  useEffect(() => {
    if (turn !== "ai" || gameOver) return;
    const timer = setTimeout(() => {
      const available = getAllEdges().filter((e) => !edges.has(e));
      if (available.length === 0) {
        setGameOver(true);
        return;
      }
      // prefer completing moves
      const completing = findCompletingEdge(edges);
      const choice =
        completing || available[Math.floor(Math.random() * available.length)];
      const ne = new Set(edges);
      ne.add(choice);
      const scored = checkBoxes(ne, "ai");
      setEdges(ne);
      const newScore = { ...scores, ai: scores.ai + scored };
      setScores(newScore);
      if (newScore.player + newScore.ai === DB_ROWS * DB_COLS) {
        setGameOver(true);
        return;
      }
      if (scored === 0) setTurn("player");
      else {
        // AI gets another turn
        setTimeout(() => setTurn("ai"), 300);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [turn, edges, gameOver, scores, checkBoxes]);

  const reset = () => {
    setEdges(new Set());
    setBoxes(
      Array(ROWS)
        .fill(null)
        .map(() => Array(COLS).fill(null)),
    );
    setTurn("player");
    setScores({ player: 0, ai: 0 });
    setGameOver(false);
  };

  const CELL = 60;
  const DOT = 8;
  const W = COLS * CELL + DOT;
  const H = ROWS * CELL + DOT;

  return (
    <GameShell
      title="Dots & Boxes"
      emoji="🟦"
      onBack={onBack}
      onReset={reset}
      userProfile={userProfile}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-6">
          <Badge variant={turn === "player" ? "default" : "secondary"}>
            You: {scores.player} {turn === "player" && "← your turn"}
          </Badge>
          <Badge variant={turn === "ai" ? "default" : "secondary"}>
            AI: {scores.ai} {turn === "ai" && "← thinking..."}
          </Badge>
        </div>
        {gameOver && (
          <div className="text-lg font-bold">
            {scores.player > scores.ai
              ? "🎉 You win!"
              : scores.ai > scores.player
                ? "🤖 AI wins!"
                : "🤝 Draw!"}
          </div>
        )}
        <svg
          width={W}
          height={H}
          className="overflow-visible"
          role="img"
          aria-label="Dots and Boxes game board"
        >
          {/* Boxes */}
          {([0, 1, 2, 3] as const).map((r) =>
            ([0, 1, 2, 3] as const).map((c) =>
              (() => {
                const owner = boxes[r][c];
                return owner ? (
                  <rect
                    key={`box-${r}-${c}`}
                    x={c * CELL + DOT / 2}
                    y={r * CELL + DOT / 2}
                    width={CELL}
                    height={CELL}
                    fill={
                      owner === "player"
                        ? "oklch(0.6 0.2 250 / 0.4)"
                        : "oklch(0.6 0.2 30 / 0.4)"
                    }
                  />
                ) : null;
              })(),
            ),
          )}
          {/* Horizontal edges */}
          {([0, 1, 2, 3, 4] as const).map((r) =>
            ([0, 1, 2, 3] as const).map((c) => {
              const key: EdgeKey = `h-${r}-${c}`;
              const filled = edges.has(key);
              return (
                <line
                  key={key}
                  x1={c * CELL + DOT / 2}
                  y1={r * CELL + DOT / 2}
                  x2={(c + 1) * CELL + DOT / 2}
                  y2={r * CELL + DOT / 2}
                  stroke={
                    filled ? "oklch(0.4 0.1 250)" : "oklch(0.6 0 0 / 0.2)"
                  }
                  strokeWidth={filled ? 4 : 2}
                  strokeLinecap="round"
                  className={
                    filled ? "" : "cursor-pointer hover:stroke-blue-500"
                  }
                  onClick={() => clickEdge(key)}
                  onKeyDown={(e) => e.key === "Enter" && clickEdge(key)}
                  role="button"
                  tabIndex={filled ? -1 : 0}
                />
              );
            }),
          )}
          {/* Vertical edges */}
          {([0, 1, 2, 3] as const).map((r) =>
            ([0, 1, 2, 3, 4] as const).map((c) => {
              const key: EdgeKey = `v-${r}-${c}`;
              const filled = edges.has(key);
              return (
                <line
                  key={key}
                  x1={c * CELL + DOT / 2}
                  y1={r * CELL + DOT / 2}
                  x2={c * CELL + DOT / 2}
                  y2={(r + 1) * CELL + DOT / 2}
                  stroke={
                    filled ? "oklch(0.4 0.1 250)" : "oklch(0.6 0 0 / 0.2)"
                  }
                  strokeWidth={filled ? 4 : 2}
                  strokeLinecap="round"
                  className={
                    filled ? "" : "cursor-pointer hover:stroke-blue-500"
                  }
                  onClick={() => clickEdge(key)}
                  onKeyDown={(e) => e.key === "Enter" && clickEdge(key)}
                  role="button"
                  tabIndex={filled ? -1 : 0}
                />
              );
            }),
          )}
          {/* Dots */}
          {([0, 1, 2, 3, 4] as const).map((r) =>
            ([0, 1, 2, 3, 4] as const).map((c) => (
              <circle
                key={`dot-${r}-${c}`}
                cx={c * CELL + DOT / 2}
                cy={r * CELL + DOT / 2}
                r={DOT / 2}
                fill="currentColor"
                className="text-foreground"
              />
            )),
          )}
        </svg>
        <p className="text-xs text-muted-foreground">
          Click edges between dots to claim boxes
        </p>
      </div>
    </GameShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAME 3: BATTLESHIP
// ═══════════════════════════════════════════════════════════════════════════════

type CellState = "empty" | "ship" | "hit" | "miss";

function makeBSGrid(): CellState[][] {
  return Array(10)
    .fill(null)
    .map(() => Array(10).fill("empty") as CellState[]);
}

function placeShipsRandom(grid: CellState[][]): CellState[][] {
  const g = grid.map((r) => [...r] as CellState[]);
  const ships = [5, 4, 3, 3, 2];
  for (const len of ships) {
    let placed = false;
    while (!placed) {
      const horiz = Math.random() > 0.5;
      const r = Math.floor(Math.random() * (10 - (horiz ? 0 : len)));
      const c = Math.floor(Math.random() * (10 - (horiz ? len : 0)));
      const cells: [number, number][] = [];
      let ok = true;
      for (let i = 0; i < len; i++) {
        const nr = r + (horiz ? 0 : i);
        const nc = c + (horiz ? i : 0);
        if (g[nr][nc] !== "empty") {
          ok = false;
          break;
        }
        cells.push([nr, nc]);
      }
      if (ok) {
        for (const [nr, nc] of cells) {
          g[nr][nc] = "ship";
        }
        placed = true;
      }
    }
  }
  return g;
}

function BattleshipGame({ onBack, userProfile }: GameProps) {
  const [phase, setPhase] = useState<"setup" | "battle" | "over">("setup");
  const [playerGrid, setPlayerGrid] = useState<CellState[][]>(makeBSGrid);
  const [aiGrid, setAiGrid] = useState<CellState[][]>(makeBSGrid);
  const [aiHiddenGrid, setAiHiddenGrid] = useState<CellState[][]>(makeBSGrid);
  const [placingShip, setPlacingShip] = useState<{
    len: number;
    idx: number;
  } | null>({ len: 5, idx: 0 });
  const [shipsToPlace] = useState([5, 4, 3, 3, 2]);
  const [shipIdx, setShipIdx] = useState(0);
  const [turn, setTurn] = useState<"player" | "ai">("player");
  const [winner, setWinner] = useState<"player" | "ai" | null>(null);
  const [aiMoves, setAiMoves] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");

  const reset = () => {
    setPhase("setup");
    setPlayerGrid(makeBSGrid());
    setAiGrid(makeBSGrid());
    setAiHiddenGrid(makeBSGrid());
    setPlacingShip({ len: 5, idx: 0 });
    setShipIdx(0);
    setTurn("player");
    setWinner(null);
    setAiMoves(new Set());
    setMessage("");
  };

  const handleSetupClick = (r: number, c: number) => {
    if (!placingShip) return;
    const len = shipsToPlace[shipIdx];
    // Place horizontally
    if (c + len > 10) {
      setMessage("Ship doesn't fit here! Try another spot.");
      return;
    }
    const ng = playerGrid.map((row) => [...row] as CellState[]);
    for (let i = 0; i < len; i++) {
      if (ng[r][c + i] !== "empty") {
        setMessage("Overlap! Choose another spot.");
        return;
      }
    }
    for (let i = 0; i < len; i++) ng[r][c + i] = "ship";
    setPlayerGrid(ng);
    setMessage("");
    const nextIdx = shipIdx + 1;
    if (nextIdx >= shipsToPlace.length) {
      const hidden = placeShipsRandom(makeBSGrid());
      setAiHiddenGrid(hidden);
      setAiGrid(makeBSGrid());
      setPlacingShip(null);
      setPhase("battle");
    } else {
      setShipIdx(nextIdx);
      setPlacingShip({ len: shipsToPlace[nextIdx], idx: nextIdx });
    }
  };

  const handlePlayerAttack = useCallback(
    (r: number, c: number) => {
      if (turn !== "player" || phase !== "battle") return;
      if (aiGrid[r][c] === "hit" || aiGrid[r][c] === "miss") return;
      const ng = aiGrid.map((row) => [...row] as CellState[]);
      const isHit = aiHiddenGrid[r][c] === "ship";
      ng[r][c] = isHit ? "hit" : "miss";
      setAiGrid(ng);
      const totalAiShips = aiHiddenGrid
        .flat()
        .filter((x) => x === "ship").length;
      const currentHitsOnAi = ng.flat().filter((x) => x === "hit").length;
      const allSunk = currentHitsOnAi >= totalAiShips;
      if (allSunk) {
        setWinner("player");
        setPhase("over");
        return;
      }
      setTurn("ai");
    },
    [turn, phase, aiGrid, aiHiddenGrid],
  );

  // AI attack
  useEffect(() => {
    if (turn !== "ai" || phase !== "battle") return;
    const timer = setTimeout(() => {
      const available: [number, number][] = [];
      for (let r = 0; r < 10; r++)
        for (let c = 0; c < 10; c++)
          if (!aiMoves.has(`${r}-${c}`)) available.push([r, c]);
      if (available.length === 0) return;
      const [ar, ac] = available[Math.floor(Math.random() * available.length)];
      const nm = new Set(aiMoves);
      nm.add(`${ar}-${ac}`);
      setAiMoves(nm);
      const ng = playerGrid.map((row) => [...row] as CellState[]);
      const isHit = ng[ar][ac] === "ship";
      ng[ar][ac] = isHit ? "hit" : "miss";
      setPlayerGrid(ng);
      const totalShips = playerGrid
        .flat()
        .filter((c) => c === "ship" || c === "hit").length;
      const hits = ng.flat().filter((c) => c === "hit").length;
      if (hits >= totalShips) {
        setWinner("ai");
        setPhase("over");
        return;
      }
      setTurn("player");
    }, 700);
    return () => clearTimeout(timer);
  }, [turn, phase, playerGrid, aiMoves]);

  const cellColor = (cell: CellState, hidden = false) => {
    if (cell === "hit") return "bg-red-500";
    if (cell === "miss") return "bg-slate-300 dark:bg-slate-600";
    if (cell === "ship" && !hidden) return "bg-slate-700 dark:bg-slate-400";
    return "bg-blue-100 dark:bg-blue-950 hover:bg-blue-200 dark:hover:bg-blue-900";
  };

  return (
    <GameShell
      title="Battleship"
      emoji="🚢"
      onBack={onBack}
      onReset={reset}
      userProfile={userProfile}
    >
      <div className="flex flex-col items-center gap-6">
        {phase === "setup" && (
          <div className="text-center">
            <p className="text-muted-foreground mb-1">
              Place your ships (click cells horizontally)
            </p>
            <Badge className="mb-4">
              Placing ship of length {shipsToPlace[shipIdx]}
            </Badge>
            {message && (
              <p className="text-destructive text-sm mb-2">{message}</p>
            )}
            <div
              className="grid gap-0.5"
              style={{ gridTemplateColumns: "repeat(10, 2.5rem)" }}
            >
              {([0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((r) =>
                ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((c) => (
                  <button
                    type="button"
                    key={`setup-${r}-${c}`}
                    onClick={() => handleSetupClick(r, c)}
                    className={`w-10 h-10 border border-border rounded-sm text-xs font-bold transition-colors ${cellColor(playerGrid[r][c])}`}
                  >
                    {playerGrid[r][c] === "ship" ? "■" : ""}
                  </button>
                )),
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ships remaining: {shipsToPlace.slice(shipIdx).join(", ")}
            </p>
          </div>
        )}
        {(phase === "battle" || phase === "over") && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div>
              <p className="text-center font-semibold mb-2">Your Fleet</p>
              <div
                className="grid gap-0.5"
                style={{ gridTemplateColumns: "repeat(10, 2rem)" }}
              >
                {([0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((r) =>
                  ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((c) => (
                    <div
                      key={`p-${r}-${c}`}
                      className={`w-8 h-8 border border-border rounded-sm flex items-center justify-center text-xs font-bold ${
                        playerGrid[r][c] === "hit"
                          ? "bg-red-500 text-white"
                          : playerGrid[r][c] === "miss"
                            ? "bg-slate-300"
                            : playerGrid[r][c] === "ship"
                              ? "bg-slate-600"
                              : "bg-blue-100 dark:bg-blue-950"
                      }`}
                    >
                      {playerGrid[r][c] === "hit"
                        ? "✕"
                        : playerGrid[r][c] === "miss"
                          ? "○"
                          : ""}
                    </div>
                  )),
                )}
              </div>
            </div>
            <div>
              <p className="text-center font-semibold mb-2">
                Enemy Waters{" "}
                {turn === "player" && phase === "battle"
                  ? "← Click to attack!"
                  : ""}
              </p>
              <div
                className="grid gap-0.5"
                style={{ gridTemplateColumns: "repeat(10, 2rem)" }}
              >
                {([0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((r) =>
                  ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((c) => (
                    <button
                      type="button"
                      key={`a-${r}-${c}`}
                      onClick={() => handlePlayerAttack(r, c)}
                      disabled={
                        aiGrid[r][c] === "hit" ||
                        aiGrid[r][c] === "miss" ||
                        turn !== "player" ||
                        phase !== "battle"
                      }
                      className={`w-8 h-8 border border-border rounded-sm flex items-center justify-center text-xs font-bold transition-colors ${
                        aiGrid[r][c] === "hit"
                          ? "bg-red-500 text-white"
                          : aiGrid[r][c] === "miss"
                            ? "bg-slate-300"
                            : "bg-blue-100 dark:bg-blue-950 hover:bg-blue-300 cursor-pointer"
                      }`}
                    >
                      {aiGrid[r][c] === "hit"
                        ? "✕"
                        : aiGrid[r][c] === "miss"
                          ? "○"
                          : ""}
                    </button>
                  )),
                )}
              </div>
            </div>
          </div>
        )}
        {phase === "over" && (
          <div
            className={`text-xl font-bold px-6 py-3 rounded-lg ${winner === "player" ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300" : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"}`}
          >
            {winner === "player"
              ? "🎉 You sunk all enemy ships! You win!"
              : "💥 Your fleet was destroyed! AI wins."}
          </div>
        )}
        {phase === "battle" && (
          <Badge variant={turn === "player" ? "default" : "secondary"}>
            {turn === "player"
              ? "Your turn — click enemy waters"
              : "AI is attacking..."}
          </Badge>
        )}
      </div>
    </GameShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAME 4: MENTAL MATHS DUEL
// ═══════════════════════════════════════════════════════════════════════════════

function makeQuestion() {
  const ops = ["+", "-", "×"] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number;
  let b: number;
  let answer: number;
  if (op === "+") {
    a = Math.floor(Math.random() * 99) + 1;
    b = Math.floor(Math.random() * 99) + 1;
    answer = a + b;
  } else if (op === "-") {
    a = Math.floor(Math.random() * 99) + 1;
    b = Math.floor(Math.random() * a) + 1;
    answer = a - b;
  } else {
    a = Math.floor(Math.random() * 12) + 1;
    b = Math.floor(Math.random() * 12) + 1;
    answer = a * b;
  }
  return { a, op, b, answer };
}

function MathsDuelGame({ onBack, userProfile }: GameProps) {
  const TOTAL = 25;
  const TIME_PER_Q = 10;

  const [questions] = useState(() => Array(TOTAL).fill(null).map(makeQuestion));
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [done, setDone] = useState(false);
  const [aiAnswered, setAiAnswered] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const advance = useCallback(() => {
    if (current + 1 >= TOTAL) {
      setDone(true);
      return;
    }
    setCurrent((c) => c + 1);
    setInput("");
    setTimeLeft(TIME_PER_Q);
    setAiAnswered(false);
    setFeedback(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [current]);

  // Timer
  // biome-ignore lint/correctness/useExhaustiveDependencies: timer resets on question change
  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setTimeLeft((tl) => {
        if (tl <= 1) {
          advance();
          return TIME_PER_Q;
        }
        return tl - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done, advance, current]);

  // AI answer
  // biome-ignore lint/correctness/useExhaustiveDependencies: AI answer per question
  useEffect(() => {
    if (done || aiAnswered) return;
    const delay = 2000 + Math.random() * 3000;
    const t = setTimeout(() => {
      const correct = Math.random() < 0.7;
      setAiAnswered(true);
      if (correct) setAiScore((s) => s + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [current, done, aiAnswered]);

  const handleSubmit = () => {
    if (done) return;
    const q = questions[current];
    const correct = Number.parseInt(input) === q.answer;
    if (correct) setPlayerScore((s) => s + 1);
    setFeedback(correct ? "correct" : "wrong");
    setTimeout(advance, 700);
  };

  const reset = () => {
    setCurrent(0);
    setInput("");
    setPlayerScore(0);
    setAiScore(0);
    setTimeLeft(TIME_PER_Q);
    setDone(false);
    setAiAnswered(false);
    setFeedback(null);
  };

  const q = questions[current];

  return (
    <GameShell
      title="Mental Maths Duel"
      emoji="🧮"
      onBack={onBack}
      onReset={reset}
      userProfile={userProfile}
    >
      <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
        <div className="flex gap-6 text-lg font-bold">
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-normal">You</p>
            <p className="text-3xl text-primary">{playerScore}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Q {current + 1}/{TOTAL}
            </p>
            <p className="text-lg">vs</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-normal">AI</p>
            <p className="text-3xl text-destructive">{aiScore}</p>
          </div>
        </div>

        {!done ? (
          <>
            <Progress
              value={(timeLeft / TIME_PER_Q) * 100}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">Time: {timeLeft}s</p>
            <Card className="w-full">
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-mono font-bold mb-4">
                  {q.a} {q.op} {q.b} = ?
                </p>
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="number"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="flex-1 border border-border rounded-lg px-4 py-2 text-center text-xl font-mono bg-background"
                    placeholder="?"
                    data-ocid="maths.input"
                  />
                  <Button
                    onClick={handleSubmit}
                    data-ocid="maths.submit_button"
                  >
                    ✓
                  </Button>
                </div>
                {feedback && (
                  <p
                    className={`mt-2 font-semibold ${feedback === "correct" ? "text-green-600" : "text-destructive"}`}
                  >
                    {feedback === "correct"
                      ? "✓ Correct!"
                      : `✗ Wrong! Answer: ${q.answer}`}
                  </p>
                )}
                {aiAnswered && (
                  <p className="text-sm text-muted-foreground mt-1">
                    🤖 AI has answered
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="w-full">
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold mb-2">
                {playerScore > aiScore
                  ? "🎉 You win!"
                  : playerScore < aiScore
                    ? "🤖 AI wins!"
                    : "🤝 Draw!"}
              </p>
              <p className="text-muted-foreground">
                Final: You {playerScore} — AI {aiScore}
              </p>
              <p className="text-sm mt-1 text-muted-foreground">
                {playerScore > aiScore
                  ? "Excellent mental arithmetic!"
                  : playerScore < aiScore
                    ? "Better luck next time. Keep practicing!"
                    : "What a tight match!"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </GameShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAME 5: STICKMAN SLAP DUEL
// ═══════════════════════════════════════════════════════════════════════════════

function Stickman({ color, slapping }: { color: string; slapping: boolean }) {
  return (
    <svg
      width="80"
      height="120"
      viewBox="0 0 80 120"
      className={slapping ? "scale-110" : ""}
      role="img"
      aria-label="Stickman character"
    >
      <title>Stickman</title>
      {/* Head */}
      <circle
        cx="40"
        cy="15"
        r="12"
        fill={color}
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Body */}
      <line
        x1="40"
        y1="27"
        x2="40"
        y2="75"
        stroke="currentColor"
        strokeWidth="3"
      />
      {/* Left arm */}
      <line
        x1="40"
        y1="40"
        x2="10"
        y2={slapping ? "30" : "60"}
        stroke="currentColor"
        strokeWidth="3"
      />
      {/* Right arm (slap arm) */}
      <line
        x1="40"
        y1="40"
        x2={slapping ? "75" : "70"}
        y2={slapping ? "20" : "60"}
        stroke="currentColor"
        strokeWidth="3"
      />
      {/* Left leg */}
      <line
        x1="40"
        y1="75"
        x2="20"
        y2="110"
        stroke="currentColor"
        strokeWidth="3"
      />
      {/* Right leg */}
      <line
        x1="40"
        y1="75"
        x2="60"
        y2="110"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  );
}

function StickmanGame({ onBack, userProfile }: GameProps) {
  const MAX_HP = 10;
  const [playerHp, setPlayerHp] = useState(MAX_HP);
  const [aiHp, setAiHp] = useState(MAX_HP);
  const [phase, setPhase] = useState<"idle" | "waiting" | "go" | "result">(
    "idle",
  );
  const [result, setResult] = useState<"player" | "ai" | null>(null);
  const [winner, setWinner] = useState<"player" | "ai" | null>(null);
  const [playerSlapping, setPlayerSlapping] = useState(false);
  const [aiSlapping, setAiSlapping] = useState(false);

  const reset = () => {
    setPlayerHp(MAX_HP);
    setAiHp(MAX_HP);
    setPhase("idle");
    setResult(null);
    setWinner(null);
    setPlayerSlapping(false);
    setAiSlapping(false);
  };

  const startRound = () => {
    if (winner) return;
    setPhase("waiting");
    setResult(null);
    setPlayerSlapping(false);
    setAiSlapping(false);
    const delay = 1500 + Math.random() * 2500;
    setTimeout(() => {
      setPhase("go");
      // AI reacts in 300-900ms
      const aiDelay = 300 + Math.random() * 600;
      setTimeout(() => {
        // If player hasn't slapped yet, AI wins this round
        setPhase((p) => {
          if (p === "go") {
            setAiSlapping(true);
            setTimeout(() => setAiSlapping(false), 400);
            setPlayerHp((hp) => {
              const newHp = hp - 1;
              if (newHp <= 0) setWinner("ai");
              return Math.max(0, newHp);
            });
            setResult("ai");
            return "result";
          }
          return p;
        });
      }, aiDelay);
    }, delay);
  };

  const handlePlayerSlap = () => {
    if (phase !== "go") {
      if (phase === "waiting") toast.error("Too early! Wait for the signal!");
      return;
    }
    setPlayerSlapping(true);
    setTimeout(() => setPlayerSlapping(false), 400);
    setAiHp((hp) => {
      const newHp = hp - 1;
      if (newHp <= 0) setWinner("player");
      return Math.max(0, newHp);
    });
    setResult("player");
    setPhase("result");
  };

  const playerWon = winner === "player";

  return (
    <GameShell
      title="Stickman Slap Duel"
      emoji="👋"
      onBack={onBack}
      onReset={reset}
      userProfile={userProfile}
    >
      <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
        {/* HP bars */}
        <div className="w-full flex gap-4 items-center">
          <div className="flex-1">
            <p className="text-sm font-semibold mb-1">You</p>
            <Progress value={(playerHp / MAX_HP) * 100} className="h-4" />
            <p className="text-xs mt-0.5">
              {playerHp}/{MAX_HP} HP
            </p>
          </div>
          <div className="text-2xl font-bold">⚔️</div>
          <div className="flex-1">
            <p className="text-sm font-semibold mb-1 text-right">AI</p>
            <Progress value={(aiHp / MAX_HP) * 100} className="h-4" />
            <p className="text-xs mt-0.5 text-right">
              {aiHp}/{MAX_HP} HP
            </p>
          </div>
        </div>

        {/* Arena */}
        <div className="flex gap-16 items-end relative">
          <motion.div animate={playerSlapping ? { x: 10 } : { x: 0 }}>
            <Stickman color="oklch(0.6 0.2 250)" slapping={playerSlapping} />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {phase === "go" && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-black text-red-500"
              >
                SLAP!
              </motion.div>
            )}
            {phase === "waiting" && (
              <div className="text-3xl animate-pulse">⏳</div>
            )}
          </div>
          <motion.div animate={aiSlapping ? { x: -10 } : { x: 0 }}>
            <Stickman color="oklch(0.6 0.2 30)" slapping={aiSlapping} />
          </motion.div>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`text-center font-bold text-lg ${
              result === "player" ? "text-green-600" : "text-destructive"
            }`}
          >
            {result === "player"
              ? "✅ You slapped first!"
              : "💥 AI was faster!"}
          </div>
        )}

        {/* Controls */}
        {!winner ? (
          <div className="flex gap-4">
            {(phase === "idle" || phase === "result") && (
              <Button
                onClick={startRound}
                size="lg"
                data-ocid="stickman.start.button"
              >
                {phase === "idle" ? "Start Round" : "Next Round"}
              </Button>
            )}
            <Button
              onClick={handlePlayerSlap}
              size="lg"
              variant="destructive"
              disabled={phase !== "go"}
              data-ocid="stickman.slap.button"
            >
              👋 SLAP!
            </Button>
          </div>
        ) : (
          <div className="text-center">
            {playerWon ? (
              <div className="space-y-4">
                <p className="text-2xl font-bold text-green-600">
                  🎉 YOU WIN! Congrats!
                </p>
                <div className="rounded-xl overflow-hidden shadow-xl">
                  <iframe
                    width="400"
                    height="225"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                    title="Victory Reward"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    className="w-full"
                  />
                </div>
                <p className="text-muted-foreground text-sm">
                  🎵 Your victory reward!
                </p>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold text-destructive">
                  💀 AI wins! You were defeated.
                </p>
                <p className="text-muted-foreground mt-2">
                  Better reaction time needed!
                </p>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Wait for the SLAP! signal, then click the slap button as fast as
          possible.
        </p>
      </div>
    </GameShell>
  );
}
