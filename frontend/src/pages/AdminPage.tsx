import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { Spinner, useToast } from "../components/ui";
import { AccessCore } from "../features/admin/AccessCore";
import { VaultDrawer } from "../features/admin/VaultDrawer";
import { UsersPanel } from "../features/admin/UsersPanel";
import { FilesPanel } from "../features/admin/FilesPanel";
import type { AdminFile, AdminUser } from "../types";

export function AdminPage() {
  const { user } = useAuth();
  const { push } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [files, setFiles] = useState<AdminFile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    const [usersRes, filesRes] = await Promise.all([
      api.listAllUsers(),
      api.listAllFiles(),
    ]);

    setLoading(false);

    if (usersRes.ok === false) {
      push({ kind: "error", text: usersRes.error.message });
      return;
    }
    if (filesRes.ok === false) {
      push({ kind: "error", text: filesRes.error.message });
      return;
    }

    setUsers(usersRes.data);
    setFiles(filesRes.data);
  };

  useEffect(() => {
    void load();
  }, []);

  const adminCount = useMemo(
    () => users.filter((u) => u.role === "ADMIN").length,
    [users]
  );

  const handleRoleChange = async (userId: string, role: "USER" | "ADMIN") => {
    const previous = users;
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));

    const res = await api.updateUserRole(userId, role);

    if (res.ok === false) {
      setUsers(previous); // revert the optimistic update
      push({ kind: "error", text: res.error.message });
      return;
    }

    push({ kind: "ok", text: `${res.data.email} is now ${role === "ADMIN" ? "an admin" : "a member"}.` });
  };

  const handleDeleteFile = async (fileId: string) => {
    const previous = files;
    setFiles((prev) => prev.filter((f) => f.id !== fileId));

    const res = await api.deleteAnyFile(fileId);

    if (res.ok === false) {
      setFiles(previous);
      push({ kind: "error", text: res.error.message });
      return;
    }

    push({ kind: "ok", text: "File deleted." });
  };

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-ink-muted">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="admin-zone flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--mist)" }}>
          Access control
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--mist-faint)" }}>
          Every action below is enforced server-side — this page reflects what
          the API allows, not the other way around.
        </p>
      </div>

      <AccessCore
        adminCount={adminCount}
        userCount={users.length - adminCount}
        viewerRole={(user?.role as "USER" | "ADMIN") ?? "USER"}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <VaultDrawer label="Members" count={users.length} defaultOpen>
          <UsersPanel
            users={users}
            currentUserId={user?.id ?? ""}
            onRoleChange={handleRoleChange}
          />
        </VaultDrawer>

        <VaultDrawer label="All files" count={files.length}>
          <FilesPanel files={files} onDelete={handleDeleteFile} />
        </VaultDrawer>
      </div>
    </div>
  );
}
