import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Shield, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useAssignUserRole, useGetAllUserProfiles } from "../hooks/useQueries";

export default function AdminPage() {
  const { data: users, isLoading } = useGetAllUserProfiles();
  const assignRole = useAssignUserRole();

  const handleMakeAdmin = async (userId: any, displayName: string) => {
    try {
      await assignRole.mutateAsync({ userId, role: UserRole.admin });
      toast.success(`${displayName} is now an admin!`);
    } catch {
      toast.error("Failed to update role.");
    }
  };

  const handleRemoveAdmin = async (userId: any, displayName: string) => {
    try {
      await assignRole.mutateAsync({ userId, role: UserRole.user });
      toast.success(`${displayName}'s admin removed.`);
    } catch {
      toast.error("Failed to update role.");
    }
  };

  return (
    <main
      className="max-w-4xl mx-auto px-4 sm:px-6 py-10"
      data-ocid="admin.page"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage member roles and permissions
          </p>
        </div>
      </div>

      {/* Users list */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="admin.users.loading_state">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : !users || users.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="admin.users.empty_state"
        >
          <UserCheck className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">
            No registered users yet
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Users will appear here once they sign up
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="admin.users.table">
          {users.map((user, idx) => {
            const isOwner = user.username === "mr_science1469";
            const isAdmin =
              user.role === "admin" || user.role === UserRole.admin;
            const rowNum = idx + 1;

            return (
              <div
                key={user.username}
                data-ocid={`admin.users.item.${rowNum}`}
                className="flex items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-secondary-foreground font-display font-bold text-sm shrink-0">
                    {user.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground truncate">
                        {user.displayName}
                      </span>
                      {isOwner && (
                        <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      @{user.username}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant={isAdmin ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {isOwner ? "Owner" : isAdmin ? "Admin" : "Member"}
                  </Badge>

                  {!isOwner &&
                    (isAdmin ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 text-xs"
                        data-ocid={`admin.remove_admin_button.${rowNum}`}
                        onClick={() =>
                          handleRemoveAdmin(user.userId, user.displayName)
                        }
                        disabled={assignRole.isPending}
                      >
                        <UserX className="w-3.5 h-3.5 mr-1" />
                        Remove Admin
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="h-8 text-xs"
                        data-ocid={`admin.make_admin_button.${rowNum}`}
                        onClick={() =>
                          handleMakeAdmin(user.userId, user.displayName)
                        }
                        disabled={assignRole.isPending}
                      >
                        <Shield className="w-3.5 h-3.5 mr-1" />
                        Make Admin
                      </Button>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
