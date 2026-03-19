import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Briefcase,
  ChevronDown,
  Crown,
  Gamepad2,
  Home,
  LogOut,
  Shield,
  Trophy,
  User,
  Vote,
} from "lucide-react";
import type { UserProfile } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type Page =
  | "home"
  | "news"
  | "leaderboard"
  | "election"
  | "admin"
  | "work"
  | "polls"
  | "games";

interface NavBarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userProfile: UserProfile | null | undefined;
  onLoginClick: () => void;
  isAdmin?: boolean;
}

const navLinks: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "Home", icon: <Home className="w-4 h-4" /> },
  { id: "news", label: "News", icon: <BookOpen className="w-4 h-4" /> },
  {
    id: "leaderboard",
    label: "Leaderboard",
    icon: <Trophy className="w-4 h-4" />,
  },
  { id: "election", label: "Election", icon: <Vote className="w-4 h-4" /> },
  { id: "work", label: "Work", icon: <Briefcase className="w-4 h-4" /> },
  {
    id: "polls",
    label: "Polls & Plans",
    icon: <Vote className="w-4 h-4" />,
  },
  {
    id: "games" as Page,
    label: "Games",
    icon: <Gamepad2 className="w-4 h-4" />,
  },
];

export default function NavBar({
  currentPage,
  onNavigate,
  userProfile,
  onLoginClick,
  isAdmin = false,
}: NavBarProps) {
  const { identity, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const initials = userProfile?.displayName
    ? userProfile.displayName.slice(0, 2).toUpperCase()
    : "?";

  const isOwner = userProfile?.username === "mr_science1469";

  const allLinks = isAdmin
    ? [
        ...navLinks,
        {
          id: "admin" as Page,
          label: "Admin Panel",
          icon: <Shield className="w-4 h-4" />,
        },
      ]
    : navLinks;

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 group"
            data-ocid="nav.link"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
              VIII
            </div>
            <span className="font-display font-bold text-foreground text-lg hidden sm:block">
              BUDOS
            </span>
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {allLinks.map((link) => (
              <button
                type="button"
                key={link.id}
                onClick={() => onNavigate(link.id)}
                data-ocid={
                  link.id === "admin" ? "nav.admin.link" : `nav.${link.id}.link`
                }
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === link.id
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </nav>

          {/* Auth section */}
          <div className="flex items-center gap-2">
            {isAuthenticated && userProfile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-9 px-3"
                    data-ocid="nav.dropdown_menu"
                  >
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground font-display font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                      {userProfile.displayName}
                    </span>
                    {isOwner && (
                      <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem
                    disabled
                    className="text-muted-foreground text-xs"
                  >
                    <User className="w-3.5 h-3.5 mr-2" />@{userProfile.username}
                  </DropdownMenuItem>
                  {isOwner && (
                    <DropdownMenuItem
                      disabled
                      className="text-xs font-semibold"
                      style={{ color: "oklch(0.72 0.18 75)" }}
                    >
                      <Crown
                        className="w-3.5 h-3.5 mr-2"
                        style={{ color: "oklch(0.72 0.18 75)" }}
                      />
                      Owner &amp; Admin Leader
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                    data-ocid="nav.logout.button"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={isAuthenticated ? handleLogout : onLoginClick}
                disabled={loginStatus === "logging-in"}
                className="h-9 font-medium"
                data-ocid="nav.login.button"
              >
                {loginStatus === "logging-in" ? "Connecting..." : "Login"}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="flex md:hidden gap-1 pb-2 overflow-x-auto">
          {allLinks.map((link) => (
            <button
              type="button"
              key={link.id}
              onClick={() => onNavigate(link.id)}
              data-ocid={
                link.id === "admin"
                  ? "nav.mobile.admin.link"
                  : `nav.mobile.${link.id}.link`
              }
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                currentPage === link.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
