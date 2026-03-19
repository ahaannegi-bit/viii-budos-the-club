import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveProfile } from "../hooks/useQueries";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  /** If true, the user is already logged in but needs to set up a profile */
  profileSetupMode?: boolean;
}

export default function AuthModal({
  open,
  onClose,
  profileSetupMode = false,
}: AuthModalProps) {
  const { login, loginStatus, identity } = useInternetIdentity();
  const saveProfile = useSaveProfile();
  const [step, setStep] = useState<"login" | "profile">(
    profileSetupMode ? "profile" : "login",
  );
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");

  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    try {
      await login();
      setStep("profile");
    } catch {
      toast.error("Login failed. Please try again.");
    }
  };

  const handleSaveProfile = async () => {
    if (!username.trim() || !displayName.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!identity) {
      toast.error("Not authenticated.");
      return;
    }
    const profile: UserProfile = {
      userId: identity.getPrincipal(),
      username: username.trim().toLowerCase(),
      displayName: displayName.trim(),
    };
    try {
      await saveProfile.mutateAsync(profile);
      toast.success(`Welcome to BUDOS, ${displayName}!`);
      onClose();
    } catch {
      toast.error("Failed to save profile.");
    }
  };

  const currentStep = profileSetupMode ? "profile" : step;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md" data-ocid="auth.dialog">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <DialogTitle className="font-display text-xl">
              {currentStep === "login" ? "Join BUDOS" : "Set Up Your Account"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {currentStep === "login"
              ? "Connect with Internet Identity to access all class features."
              : "Choose a username and display name for your BUDOS account."}
          </DialogDescription>
        </DialogHeader>

        {currentStep === "login" ? (
          <div className="space-y-4 pt-2">
            <div className="rounded-xl bg-secondary p-4 text-sm text-secondary-foreground">
              <p className="font-medium mb-1">What you get:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>✓ Vote in class elections</li>
                <li>✓ See class news & announcements</li>
                <li>✓ Track the leaderboard</li>
              </ul>
            </div>
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full h-11 font-medium"
              data-ocid="auth.login.button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect with Internet Identity"
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full"
              data-ocid="auth.cancel.button"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="e.g. rohit123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-ocid="auth.username.input"
              />
              <p className="text-xs text-muted-foreground">
                Lowercase, no spaces
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="e.g. Rohit Sharma"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                data-ocid="auth.displayname.input"
              />
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={saveProfile.isPending}
              className="w-full h-11 font-medium"
              data-ocid="auth.save_profile.button"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Join the Class!"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
