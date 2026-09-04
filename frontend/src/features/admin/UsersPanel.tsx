import type { AdminUser } from "../../types";
import { formatDate } from "../../lib/format";
import { VaultSwitch } from "./VaultSwitch";

export function UsersPanel({
  users,
  currentUserId,
  onRoleChange,
}: {
  users: AdminUser[];
  currentUserId: string;
  onRoleChange: (userId: string, role: "USER" | "ADMIN") => Promise<void>;
}) {
  if (users.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-sm" style={{ color: "var(--mist-faint)" }}>
        No members yet.
      </p>
    );
  }

  return (
    <ul className="divide-y" style={{ borderColor: "var(--steel-line)" }}>
      {users.map((u) => {
        const isSelf = u.id === currentUserId;
        return (
          <li
            key={u.id}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div className="min-w-0">
              <div className="truncate text-sm" style={{ color: "var(--mist)" }}>
                {u.email}
                {isSelf && (
                  <span className="ml-2 font-mono text-[10px]" style={{ color: "var(--mist-faint)" }}>
                    (you)
                  </span>
                )}
              </div>
              <div className="font-mono text-xs" style={{ color: "var(--mist-faint)" }}>
                joined {formatDate(u.createdAt)}
              </div>
            </div>
            <VaultSwitch
              role={u.role}
              disabled={isSelf && u.role === "ADMIN"}
              onChange={(next) => onRoleChange(u.id, next)}
            />
          </li>
        );
      })}
    </ul>
  );
}
