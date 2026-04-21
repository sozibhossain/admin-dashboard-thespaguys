"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
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
import { Input } from "@/components/ui/input";
import { api, getApiErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function TechniciansPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: ["admin-technicians", page, status, search],
    queryFn: () =>
      api.getTechnicians({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
      }),
  });

  const detailQuery = useQuery({
    queryKey: ["technician-detail", selectedId],
    queryFn: () => api.getTechnicianDetail(selectedId!),
    enabled: !!selectedId,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.updateTechnicianStatus(id, isActive),
    onSuccess: () => {
      toast.success("Technician status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-technicians"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <div>
      <PageHeader
        title="Technician Management"
        breadcrumb="Dashboard  >  Technician Management"
        actions={
          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex flex-wrap gap-3">
              <button className="text-[#f4c542]" type="button">
                <FileSpreadsheet className="size-7" />
              </button>
              <Button variant="primary">
                <SlidersHorizontal className="mr-2 size-5" />
                Customize
              </Button>
              <Button variant="primary">
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
        {listQuery.isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="overflow-x-auto rounded-[24px] border border-[#343434]">
              <table className="min-w-full">
                <thead className="bg-[#2a2a2a] text-left text-[16px] font-medium text-white">
                  <tr>
                    {["User Name", "Email", "Service", "Status", "Action"].map((heading) => (
                      <th className="px-6 py-5" key={heading}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listQuery.data?.technicians.map((technician) => (
                    <tr className="border-t border-[#343434]" key={technician._id}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Avatar
                            className="size-11"
                            name={technician.name}
                            src={technician.avatar}
                          />
                          <span>{technician.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[#d4d4d4]">{technician.email}</td>
                      <td className="px-6 py-5 text-[#d4d4d4]">
                        {technician.serviceName || technician.specialization || technician.service}
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge value={technician.isActive ? "Active" : "Inactive"} />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4 text-white">
                          <button
                            onClick={() =>
                              statusMutation.mutate({
                                id: technician._id,
                                isActive: !technician.isActive,
                              })
                            }
                            type="button"
                          >
                            <Trash2 className="size-5 text-[#ff3030]" />
                          </button>
                          <Link href={`/dashboard/users/${technician._id}`}>
                            <MessageSquareText className="size-5 text-[#d0d0d0]" />
                          </Link>
                          <button onClick={() => setSelectedId(technician._id)} type="button">
                            <MessageSquareText className="size-5 text-[#d0d0d0]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-[#9b9b9b]">
                Showing {(page - 1) * 10 + 1} to {(page - 1) * 10 + (listQuery.data?.technicians.length ?? 0)} of {listQuery.data?.total ?? 0} results
              </p>
              <Pagination
                page={page}
                totalPages={Math.max(listQuery.data?.totalPages ?? 1, 1)}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </section>

      <Modal open={!!selectedId} onClose={() => setSelectedId(null)} className="max-w-[700px]">
        {detailQuery.isLoading ? (
          <div className="space-y-4">
            <div className="flex justify-end gap-3">
              <div className="h-12 w-28 rounded-xl bg-[#3a3a3a]" />
              <div className="h-12 w-20 rounded-xl bg-[#3a3a3a]" />
            </div>
            <div className="mx-auto h-20 w-20 rounded-full bg-[#3a3a3a]" />
            <div className="mx-auto h-6 w-40 rounded bg-[#3a3a3a]" />
          </div>
        ) : detailQuery.data?.technician ? (
          <div>
            <div className="mb-8 flex justify-end gap-3">
              <Button variant="danger">
                <Trash2 className="mr-2 size-4" />
                Delete
              </Button>
              <Button variant="surface">Edit</Button>
            </div>
            <div className="text-center">
              <Avatar
                className="mx-auto size-20"
                name={detailQuery.data.technician.name}
                src={detailQuery.data.technician.avatar}
              />
              <p className="mt-5 text-[30px] font-medium">{detailQuery.data.technician.name}</p>
            </div>
            <div className="mt-8 grid gap-4 rounded-[22px] bg-[#4b4b4b] p-6 md:grid-cols-3">
              <div>
                <p className="text-sm text-[#d9d9d9]">Total Earnings</p>
                <p className="mt-3 text-[20px] font-semibold text-[#f4c542]">
                  {formatCurrency(12978)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#d9d9d9]">Task Completed</p>
                <p className="mt-3 text-[20px] font-semibold text-[#f4c542]">32 Jobs</p>
              </div>
              <div>
                <p className="text-sm text-[#d9d9d9]">Rating</p>
                <p className="mt-3 text-[20px] font-semibold text-[#f4c542]">
                  {detailQuery.data.technician.rating?.average ?? 0}
                </p>
              </div>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div>
                <p className="mb-2 text-sm text-[#d9d9d9]">Service</p>
                <p>{detailQuery.data.technician.serviceName || detailQuery.data.technician.service}</p>
              </div>
              <div>
                <p className="mb-2 text-sm text-[#d9d9d9]">Email</p>
                <p>{detailQuery.data.technician.email}</p>
              </div>
              <div>
                <p className="mb-2 text-sm text-[#d9d9d9]">Phone</p>
                <p>{detailQuery.data.technician.phone}</p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
