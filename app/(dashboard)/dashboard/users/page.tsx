"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Eye,
  FileSpreadsheet,
  MessageSquareText,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { api, getApiErrorMessage } from "@/lib/api";

function RoleVisibilityModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const visibilityQuery = useQuery({
    queryKey: ["role-visibility"],
    queryFn: api.getRoleVisibility,
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: api.updateRoleVisibility,
    onSuccess: () => {
      toast.success("Role visibility updated");
      queryClient.invalidateQueries({ queryKey: ["role-visibility"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const visibility = visibilityQuery.data?.visibility;
  const userEntries = visibility ? Object.entries(visibility.customer) : [];
  const techEntries = visibility ? Object.entries(visibility.spaguy) : [];

  function toggle(section: "customer" | "spaguy", key: string, checked: boolean) {
    if (!visibility) return;
    mutation.mutate({
      ...visibility,
      [section]: {
        ...visibility[section],
        [key]: checked,
      },
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change Role Visibility"
      description="Select what technicians and employees can see and access."
      className="max-w-[900px]"
    >
      {[["Users View", "customer", userEntries], ["Technician", "spaguy", techEntries]].map(
        ([label, section, entries]) => (
          <div className="mb-10" key={String(section)}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[20px] font-semibold text-[#f4c542]">{label}</h3>
              <button className="text-[18px] font-medium text-[#f4c542]" type="button">
                Create New
              </button>
            </div>
            <div className="rounded-[20px] bg-[#505050] px-6 py-4">
              {(entries as [string, boolean][]).map(([key, value]) => (
                <div
                  className="flex items-center justify-between border-b border-[#d4a100] py-5 last:border-b-0"
                  key={key}
                >
                  <span className="text-[18px] capitalize text-white">{key}</span>
                  <div className="flex items-center gap-6">
                    <button className="rounded-lg bg-[rgba(255,48,48,0.15)] p-2 text-[#ff3030]" type="button">
                      <Trash2 className="size-5" />
                    </button>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        checked={value}
                        className="peer sr-only"
                        onChange={(event) =>
                          toggle(section as "customer" | "spaguy", key, event.target.checked)
                        }
                        type="checkbox"
                      />
                      <div className="h-8 w-12 rounded-full bg-[#846400] peer-checked:bg-[#d4a100]" />
                      <div className="absolute left-1 top-1 size-6 rounded-full bg-white transition peer-checked:translate-x-4" />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      )}
    </Modal>
  );
}

function GlobalNotificationModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState<"customer" | "spaguy" | "all">("all");

  const mutation = useMutation({
    mutationFn: api.sendGlobalNotification,
    onSuccess: () => {
      toast.success("Notification sent");
      onClose();
      setTitle("");
      setMessage("");
      setTargetRole("all");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Send Global Notification"
      description="This message will be broadcasted to all active technicians and users across the platform."
      className="max-w-[900px]"
    >
      <div className="space-y-6">
        <div>
          <label className="mb-3 block text-[18px] font-semibold text-[#f4c542]">
            NOTIFICATION TITLE
          </label>
          <Input
            className="border-[#4d4d4d] bg-[#4c4c4c]"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g., System Maintenance Update"
            value={title}
          />
        </div>
        <div>
          <label className="mb-3 block text-[18px] font-semibold text-[#f4c542]">
            MESSAGE CONTENT
          </label>
          <Textarea
            className="border-[#4d4d4d] bg-[#4c4c4c]"
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write your broadcast message here..."
            value={message}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "User's", value: "customer" },
            { label: "Technician", value: "spaguy" },
            { label: "All", value: "all" },
          ].map((item) => (
            <button
              className={`flex h-16 items-center justify-between rounded-2xl border px-6 ${
                targetRole === item.value
                  ? "border-[#f4c542] bg-[#454545]"
                  : "border-[#4d4d4d] bg-[#4c4c4c]"
              }`}
              key={item.value}
              onClick={() => setTargetRole(item.value as "customer" | "spaguy" | "all")}
              type="button"
            >
              <span className="text-[18px]">{item.label}</span>
              <span
                className={`size-6 rounded border-2 ${
                  targetRole === item.value ? "border-[#f4c542] bg-[#f4c542]" : "border-white"
                }`}
              />
            </button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate({ title, message, targetRoles: targetRole })}
          >
            Send to All
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const usersQuery = useQuery({
    queryKey: ["admin-users", page, status, search],
    queryFn: () =>
      api.getUsers({
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.updateUserStatus(id, isActive),
    onSuccess: () => {
      toast.success("User status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const rows = useMemo(() => usersQuery.data?.users ?? [], [usersQuery.data?.users]);

  return (
    <div>
      <PageHeader
        title="User Management"
        breadcrumb="Dashboard  >  User Management"
        actions={
          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex flex-wrap gap-3">
              <button className="text-[#f4c542]" type="button">
                <FileSpreadsheet className="size-7" />
              </button>
              <Button onClick={() => setCustomizeOpen(true)} variant="primary">
                <SlidersHorizontal className="mr-2 size-5" />
                Customize
              </Button>
              <Button onClick={() => setNotificationOpen(true)} variant="primary">
                <Bell className="mr-2 size-5" />
                Notification
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-[360px_150px]">
              <div className="relative">
                <Input
                  className="border-[#6e6e6e] bg-[#181818] pr-14"
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search"
                  value={search}
                />
                <div className="gold-gradient absolute right-0 top-0 flex h-14 w-16 items-center justify-center rounded-r-xl">
                  <Search className="size-5" />
                </div>
              </div>
              <Select
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                value={status}
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
        }
      />

      <section className="panel-gradient rounded-[24px] border border-[#343434] p-5">
        {usersQuery.isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="overflow-x-auto rounded-[24px] border border-[#343434]">
              <table className="min-w-full">
                <thead className="bg-[#2a2a2a] text-left text-[16px] font-medium text-white">
                  <tr>
                    {["User Name", "Email", "Location", "Status", "Action"].map((heading) => (
                      <th className="px-6 py-5" key={heading}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((user) => (
                    <tr className="border-t border-[#343434]" key={user._id}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-11" name={user.name} src={user.avatar} />
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[#d4d4d4]">{user.email}</td>
                      <td className="px-6 py-5 text-[#d4d4d4]">
                        {user.address?.city || user.address?.state || "Unknown"}
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge value={user.isActive ? "Active" : "Inactive"} />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4 text-white">
                          <button
                            onClick={() =>
                              statusMutation.mutate({
                                id: user._id,
                                isActive: !user.isActive,
                              })
                            }
                            type="button"
                          >
                            <Trash2 className="size-5 text-[#ff3030]" />
                          </button>
                          <Link href={`/dashboard/users/${user._id}`}>
                            <MessageSquareText className="size-5 text-[#d0d0d0]" />
                          </Link>
                          <Link href={`/dashboard/users/${user._id}`}>
                            <Eye className="size-5 text-[#d0d0d0]" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-[#9b9b9b]">
                Showing {rows.length ? (page - 1) * limit + 1 : 0} to {(page - 1) * limit + rows.length} of {usersQuery.data?.total ?? 0} results
              </p>
              <Pagination
                page={page}
                totalPages={Math.max(usersQuery.data?.totalPages ?? 1, 1)}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </section>

      <RoleVisibilityModal onClose={() => setCustomizeOpen(false)} open={customizeOpen} />
      <GlobalNotificationModal
        onClose={() => setNotificationOpen(false)}
        open={notificationOpen}
      />
    </div>
  );
}
