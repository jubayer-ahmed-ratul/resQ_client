"use client";

import { useEffect, useState } from "react";
import { userApi, getToken, type User } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { roleBadgeColor, roleLabel, type UserRole } from "@/lib/auth";
import {
  Users, Search, Shield, Mail, Calendar,
  ChevronDown, ChevronUp, Loader2, CheckCircle2,
  X, Pencil, UserX, UserCheck, Plus,
} from "lucide-react";

type EditingUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
};

export default function UsersPage() {
  const { ready, token: authToken } = useAuth({ require: ["ADMIN"] });

  const [users, setUsers]             = useState<User[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [search, setSearch]           = useState("");
  const [roleFilter, setRoleFilter]   = useState("");
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Create form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading]   = useState(false);
  const [createError, setCreateError]       = useState("");
  const [createSuccess, setCreateSuccess]   = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "CITIZEN" as UserRole });

  // Edit form
  const [editingUser, setEditingUser]   = useState<EditingUser | null>(null);
  const [editLoading, setEditLoading]   = useState(false);
  const [editError, setEditError]       = useState("");
  const [editSuccess, setEditSuccess]   = useState(false);

  useEffect(() => {
    if (!ready) return;
    const t = authToken ?? getToken();
    if (t) fetchUsers(t);
  }, [ready, authToken, roleFilter]);

  const fetchUsers = (t: string) => {
    setLoading(true);
    userApi.list(t, roleFilter ? { role: roleFilter as UserRole } : undefined)
      .then((res) => setUsers(res.data.data ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load users"))
      .finally(() => setLoading(false));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = authToken ?? getToken();
    if (!t) return;
    setCreateError(""); setCreateLoading(true);
    try {
      await userApi.create(newUser, t);
      setCreateSuccess(true);
      setNewUser({ name: "", email: "", password: "", role: "CITIZEN" });
      fetchUsers(t);
      setTimeout(() => { setShowCreateForm(false); setCreateSuccess(false); }, 1500);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const t = authToken ?? getToken();
    if (!t) return;
    setEditError(""); setEditLoading(true);
    try {
      const body: Parameters<typeof userApi.update>[1] = {
        name:  editingUser.name,
        email: editingUser.email,
        role:  editingUser.role,
      };
      if (editingUser.password) body.password = editingUser.password;
      await userApi.update(editingUser.id, body, t);
      setEditSuccess(true);
      fetchUsers(t);
      setTimeout(() => { setEditingUser(null); setEditSuccess(false); }, 1200);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleActive = async (u: User) => {
    const t = authToken ?? getToken();
    if (!t) return;
    setActionLoading(u.id);
    try {
      if (u.status === "INACTIVE") {
        await userApi.activate(u.id, t);
      } else {
        await userApi.deactivate(u.id, t);
      }
      fetchUsers(t);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  if (!ready) return (
    <div className="flex h-40 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#19C3B1] border-t-transparent" />
    </div>
  );

  const inputClass = "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#19C3B1] focus:ring-2 focus:ring-[#19C3B1]/20";
  const inputStyle = { borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" };
  const labelClass = "mb-1.5 block text-sm font-medium";
  const labelStyle = { color: "#374151" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0B1F33" }}>Users</h1>
          <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>Manage all system users and their roles</p>
        </div>
        <button
          onClick={() => { setShowCreateForm((v) => !v); setCreateError(""); setCreateSuccess(false); }}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#14A89A]"
          style={{ backgroundColor: "#19C3B1" }}
        >
          {showCreateForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreateForm ? "Cancel" : "Create User"}
        </button>
      </div>

      {/* ── Create form ── */}
      {showCreateForm && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "rgba(11,31,51,0.08)" }}>
          <h2 className="mb-4 text-base font-bold" style={{ color: "#0B1F33" }}>Create New User</h2>
          {createSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm"
              style={{ backgroundColor: "rgba(25,195,177,0.06)", borderColor: "rgba(25,195,177,0.25)", color: "#0B1F33" }}>
              <CheckCircle2 className="h-4 w-4" style={{ color: "#19C3B1" }} /> User created!
            </div>
          )}
          {createError && (
            <div className="mb-4 rounded-xl border px-4 py-3 text-sm"
              style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}>
              {createError}
            </div>
          )}
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} style={labelStyle}>Full Name</label>
              <input type="text" required value={newUser.name}
                onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                placeholder="Jane Doe" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Email</label>
              <input type="email" required value={newUser.email}
                onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                placeholder="jane@example.com" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Password</label>
              <input type="password" required minLength={6} value={newUser.password}
                onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                placeholder="Min. 6 characters" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Role</label>
              <select value={newUser.role}
                onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value as UserRole }))}
                className={inputClass} style={inputStyle}>
                {(["ADMIN", "COORDINATOR", "OPERATOR", "CITIZEN"] as UserRole[]).map((r) => (
                  <option key={r} value={r}>{roleLabel[r]}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setShowCreateForm(false)}
                className="rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50"
                style={{ borderColor: "rgba(11,31,51,0.15)", color: "#6B7280" }}>Cancel</button>
              <button type="submit" disabled={createLoading}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#14A89A] disabled:opacity-60"
                style={{ backgroundColor: "#19C3B1" }}>
                {createLoading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Creating…</span> : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Edit form ── */}
      {editingUser && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "rgba(124,58,237,0.2)" }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold" style={{ color: "#0B1F33" }}>Edit User</h2>
            <button onClick={() => setEditingUser(null)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="h-4 w-4" style={{ color: "#6B7280" }} />
            </button>
          </div>
          {editSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm"
              style={{ backgroundColor: "rgba(25,195,177,0.06)", borderColor: "rgba(25,195,177,0.25)", color: "#0B1F33" }}>
              <CheckCircle2 className="h-4 w-4" style={{ color: "#19C3B1" }} /> Updated!
            </div>
          )}
          {editError && (
            <div className="mb-4 rounded-xl border px-4 py-3 text-sm"
              style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}>
              {editError}
            </div>
          )}
          <form onSubmit={handleEditSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} style={labelStyle}>Full Name</label>
              <input type="text" required value={editingUser.name}
                onChange={(e) => setEditingUser((p) => p && { ...p, name: e.target.value })}
                className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Email</label>
              <input type="email" required value={editingUser.email}
                onChange={(e) => setEditingUser((p) => p && { ...p, email: e.target.value })}
                className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Role</label>
              <select value={editingUser.role}
                onChange={(e) => setEditingUser((p) => p && { ...p, role: e.target.value as UserRole })}
                className={inputClass} style={inputStyle}>
                {(["ADMIN", "COORDINATOR", "OPERATOR", "CITIZEN"] as UserRole[]).map((r) => (
                  <option key={r} value={r}>{roleLabel[r]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>New Password <span className="text-xs font-normal" style={{ color: "#9CA3AF" }}>(leave blank to keep)</span></label>
              <input type="password" minLength={6} value={editingUser.password}
                onChange={(e) => setEditingUser((p) => p && { ...p, password: e.target.value })}
                placeholder="••••••••" className={inputClass} style={inputStyle} />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setEditingUser(null)}
                className="rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50"
                style={{ borderColor: "rgba(11,31,51,0.15)", color: "#6B7280" }}>Cancel</button>
              <button type="submit" disabled={editLoading}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1A3550] disabled:opacity-60"
                style={{ backgroundColor: "#0B1F33" }}>
                {editLoading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving…</span> : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#9CA3AF" }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-xl border pl-9 pr-4 py-2 text-sm outline-none focus:border-[#19C3B1]"
            style={{ borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" }} />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-[#19C3B1]"
          style={{ borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" }}>
          <option value="">All Roles</option>
          {(["ADMIN", "COORDINATOR", "OPERATOR", "CITIZEN"] as UserRole[]).map((r) => (
            <option key={r} value={r}>{roleLabel[r]}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(230,57,70,0.06)", borderColor: "rgba(230,57,70,0.2)", color: "#E63946" }}>
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#19C3B1] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed"
          style={{ borderColor: "rgba(11,31,51,0.15)" }}>
          <Users className="h-8 w-8" style={{ color: "#9CA3AF" }} />
          <p className="text-sm" style={{ color: "#6B7280" }}>No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => {
            const badge      = roleBadgeColor[u.role as UserRole];
            const isExpanded = expandedId === u.id;
            const inactive   = u.status === "INACTIVE";

            return (
              <div key={u.id}
                className={`rounded-2xl border bg-white shadow-sm transition-all ${inactive ? "opacity-60" : ""}`}
                style={{ borderColor: "rgba(11,31,51,0.08)" }}>

                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Avatar */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: inactive ? "#9CA3AF" : "#0B1F33" }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm" style={{ color: "#0B1F33" }}>{u.name}</span>
                      {badge && (
                        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                          style={{ backgroundColor: badge.bg, color: badge.text }}>
                          {roleLabel[u.role as UserRole] ?? u.role}
                        </span>
                      )}
                      {inactive && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold text-gray-500">
                          INACTIVE
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs truncate" style={{ color: "#6B7280" }}>{u.email}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Edit */}
                    <button
                      onClick={() => { setEditingUser({ id: u.id, name: u.name, email: u.email, role: u.role as UserRole, password: "" }); setEditError(""); setEditSuccess(false); }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Edit user"
                    >
                      <Pencil className="h-4 w-4" style={{ color: "#6B7280" }} />
                    </button>

                    {/* Deactivate / Activate */}
                    <button
                      onClick={() => handleToggleActive(u)}
                      disabled={actionLoading === u.id}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                      title={inactive ? "Activate user" : "Deactivate user"}
                    >
                      {actionLoading === u.id
                        ? <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#9CA3AF" }} />
                        : inactive
                        ? <UserCheck className="h-4 w-4" style={{ color: "#19C3B1" }} />
                        : <UserX className="h-4 w-4" style={{ color: "#E63946" }} />
                      }
                    </button>

                    {/* Expand */}
                    <button onClick={() => setExpandedId(isExpanded ? null : u.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      {isExpanded
                        ? <ChevronUp className="h-4 w-4" style={{ color: "#6B7280" }} />
                        : <ChevronDown className="h-4 w-4" style={{ color: "#6B7280" }} />
                      }
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t px-4 py-4"
                    style={{ borderColor: "rgba(11,31,51,0.06)" }}>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
                      <Detail Icon={Mail}     label="Email"   value={u.email} />
                      <Detail Icon={Shield}   label="Role"    value={roleLabel[u.role as UserRole] ?? u.role} />
                      <Detail Icon={Calendar} label="User ID" value={u.id} mono />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-center" style={{ color: "#9CA3AF" }}>
          Showing {filtered.length} of {users.length} users
        </p>
      )}
    </div>
  );
}

function Detail({ Icon, label, value, mono = false }:
  { Icon: React.ElementType; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: "rgba(11,31,51,0.05)" }}>
        <Icon className="h-3.5 w-3.5" style={{ color: "#6B7280" }} strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-[11px] font-medium" style={{ color: "#9CA3AF" }}>{label}</p>
        <p className={`text-xs font-semibold break-all ${mono ? "font-mono" : ""}`} style={{ color: "#243447" }}>
          {value}
        </p>
      </div>
    </div>
  );
}
