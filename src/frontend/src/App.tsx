import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AuthModal from "./components/AuthModal";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile, useIsAdmin } from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import ElectionPage from "./pages/ElectionPage";
import GamesPage from "./pages/GamesPage";
import HomePage from "./pages/HomePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import NewsPage from "./pages/NewsPage";
import PollsPage from "./pages/PollsPage";
import WorkPage from "./pages/WorkPage";

type Page =
  | "home"
  | "news"
  | "leaderboard"
  | "election"
  | "admin"
  | "work"
  | "polls"
  | "games";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const { data: isAdmin } = useIsAdmin();

  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  const handleLoginClick = () => setAuthModalOpen(true);
  const handleAuthClose = () => setAuthModalOpen(false);

  const handleNavigate = (page: Page) => {
    if (page === "admin" && !isAdmin) return;
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        userProfile={userProfile}
        onLoginClick={handleLoginClick}
        isAdmin={isAdmin ?? false}
      />

      <div className="flex-1">
        {currentPage === "home" && (
          <HomePage onNavigate={handleNavigate} isAdmin={isAdmin ?? false} />
        )}
        {currentPage === "news" && (
          <NewsPage
            isAdmin={isAdmin ?? false}
            isAuthenticated={isAuthenticated}
            userProfile={userProfile}
          />
        )}
        {currentPage === "leaderboard" && (
          <LeaderboardPage isAdmin={isAdmin ?? false} />
        )}
        {currentPage === "election" && (
          <ElectionPage
            isAdmin={isAdmin ?? false}
            isAuthenticated={isAuthenticated}
            onLoginClick={handleLoginClick}
          />
        )}
        {currentPage === "work" && (
          <WorkPage isAuthenticated={isAuthenticated} />
        )}
        {currentPage === "polls" && (
          <PollsPage
            isAuthenticated={isAuthenticated}
            userProfile={userProfile}
          />
        )}
        {currentPage === "games" && (
          <GamesPage
            isAuthenticated={isAuthenticated}
            userProfile={userProfile}
          />
        )}
        {currentPage === "admin" && isAdmin && <AdminPage />}
        {currentPage === "admin" && !isAdmin && (
          <HomePage onNavigate={handleNavigate} isAdmin={false} />
        )}
      </div>

      <Footer />

      <AuthModal
        open={authModalOpen && !showProfileSetup}
        onClose={handleAuthClose}
      />

      <AuthModal open={showProfileSetup} onClose={() => {}} profileSetupMode />

      <Toaster richColors position="top-right" />
    </div>
  );
}
