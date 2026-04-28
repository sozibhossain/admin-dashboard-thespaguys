"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock3, Eye, MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { api, getApiErrorMessage } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

const SERVICE_REQUEST_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "quoted", label: "Quoted" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function ServiceRequestsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assignForm, setAssignForm] = useState({
    technicianId: "",
    scheduledDate: "",
    scheduledTime: "8:00 AM - 3:00 PM",
    sessionDuration: 90,
    serviceFee: 100,
    facilityTax: 8,
  });

  const listQuery = useQuery({
    queryKey: ["service-requests", page, status, search],
    queryFn: () =>
      api.getServiceRequests({
        page,
        limit: 10,
        status: status || undefined,
        search: search || undefined,
      }),
  });

  const detailQuery = useQuery({
    queryKey: ["service-request", selectedId],
    queryFn: () => api.getServiceRequestDetail(selectedId!),
    enabled: !!selectedId,
  });

  const techniciansQuery = useQuery({
    queryKey: ["technician-options"],
    queryFn: () => api.getTechnicians({ page: 1, limit: 50 }),
  });

  const assignMutation = useMutation({
    mutationFn: () =>
      api.assignServiceRequest(selectedId!, {
        ...assignForm,
        serviceFee: Number(assignForm.serviceFee),
        facilityTax: Number(assignForm.facilityTax),
        sessionDuration: Number(assignForm.sessionDuration),
      }),
    onSuccess: () => {
      toast.success("Service request assigned");
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      queryClient.invalidateQueries({
        queryKey: ["service-request", selectedId],
      });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const statusMutation = useMutation({
    mutationFn: (nextStatus: string) =>
      api.updateServiceRequestStatus(selectedId!, nextStatus),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      queryClient.invalidateQueries({
        queryKey: ["service-request", selectedId],
      });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const detail = detailQuery.data?.request;
  const technicians = techniciansQuery.data?.technicians ?? [];
  const handleStatusChange = (nextStatus: string) => {
    if (!detail || nextStatus === detail.status) return;
    statusMutation.mutate(nextStatus);
  };
  const totalFee = useMemo(
    () =>
      Number(assignForm.serviceFee || 0) + Number(assignForm.facilityTax || 0),
    [assignForm.facilityTax, assignForm.serviceFee],
  );

  return (
    <div>
      <PageHeader
        title="User Management"
        breadcrumb="Dashboard  >  Service Request"
        actions={
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
              {SERVICE_REQUEST_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
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
                    {[
                      "Date & Time",
                      "User Name",
                      "Technician's Name",
                      "Service",
                      "Status",
                      "Activity",
                      "Action",
                    ].map((heading) => (
                      <th className="px-6 py-5" key={heading}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listQuery.data?.requests.map((request) => (
                    <tr className="border-t border-[#343434]" key={request._id}>
                      <td className="px-6 py-5 text-[#d4d4d4]">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="size-4" />
                          {request.scheduledDate
                            ? `${formatDate(request.scheduledDate, "dd MMMM")} - ${request.scheduledTime}`
                            : "Awaiting schedule"}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Avatar
                            className="size-11"
                            name={request.customer?.name}
                            src={request.customer?.avatar}
                          />
                          <span>{request.customer?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Avatar
                            className="size-11"
                            name={request.assignedTechnician?.name}
                            src={request.assignedTechnician?.avatar}
                          />
                          <span>
                            {request.assignedTechnician?.name || "Unassigned"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[#d4d4d4]">
                        {request.serviceType}
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge
                          value={
                            request.paymentStatus === "paid"
                              ? "Paid"
                              : "Non paid"
                          }
                        />
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge
                          value={request.status.replaceAll("_", " ")}
                        />
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => setSelectedId(request._id)}
                          type="button"
                        >
                          <Eye className="size-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-[#9b9b9b]">
                Showing {(page - 1) * 10 + 1} to{" "}
                {(page - 1) * 10 + (listQuery.data?.requests.length ?? 0)} of{" "}
                {listQuery.data?.total ?? 0} results
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

      <Modal
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        className="max-w-[1512px]"
      >
        {detail ? (
          detail.status === "completed" ? (
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[#4d4d4d] p-5">
                <div>
                  <p className="mb-2 text-[14px] uppercase text-[#b9b9b9]">
                    Request Status
                  </p>
                  <StatusBadge value={detail.status.replaceAll("_", " ")} />
                </div>
                <div className="min-w-[240px]">
                  <Select
                    className="h-12"
                    disabled={statusMutation.isPending}
                    onChange={(event) => handleStatusChange(event.target.value)}
                    value={detail.status}
                  >
                    {SERVICE_REQUEST_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
                <div>
                  <h2 className="mb-8 text-[30px] font-medium">
                    Order summary
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="mb-3 block text-[18px] font-semibold">
                        Presenting Problem
                      </label>
                      <Textarea
                        value={
                          detail.presentingProblem || detail.problemDescription
                        }
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="mb-3 block text-[18px] font-semibold">
                        Diagnosis
                      </label>
                      <Textarea
                        value={detail.diagnosis || "No diagnosis provided"}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="mb-3 block text-[18px] font-semibold">
                        Post Service Documentation
                      </label>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {(detail.postServicePhotos?.length
                          ? detail.postServicePhotos
                          : detail.evidencePhotos
                        ).map((photo, index) => (
                          <div
                            className="h-28 rounded-2xl bg-center bg-cover"
                            key={`${photo.url}-${index}`}
                            style={{ backgroundImage: `url(${photo.url})` }}
                          />
                        ))}
                      </div>
                    </div>
                    {detail.additionalCosts.length ? (
                      <div className="border-t border-[#d4a100] pt-8">
                        <h3 className="mb-5 text-[18px] font-semibold">
                          Additional Charges
                        </h3>
                        {detail.additionalCosts.map((cost) => (
                          <div
                            className="rounded-2xl bg-[#6a6a6a] p-5"
                            key={cost._id}
                          >
                            <div className="flex justify-between gap-4">
                              <p className="text-[18px] font-semibold text-[#ffc737]">
                                {cost.name}
                              </p>
                              <p className="text-[18px] font-semibold text-[#ffc737]">
                                {formatCurrency(cost.amount)}
                              </p>
                            </div>
                            <p className="mt-3 text-[16px] text-[#efefef]">
                              {cost.notes || cost.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <Button
                      className="h-16 w-full text-[18px]"
                      onClick={() => setSelectedId(null)}
                    >
                      Done
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[22px] bg-[#6a6a6a] p-6">
                    <p className="text-[18px] uppercase">Technician</p>
                    <div className="mt-6 flex items-center gap-4">
                      <Avatar
                        className="size-14"
                        name={detail.assignedTechnician?.name}
                        src={detail.assignedTechnician?.avatar}
                      />
                      <div>
                        <p className="text-[18px] text-[#ffc737]">
                          {detail.assignedTechnician?.name}
                        </p>
                        <p className="text-sm">
                          ★ {detail.assignedTechnician?.rating?.average ?? 0} (
                          {detail.assignedTechnician?.rating?.count ?? 0}{" "}
                          reviews)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] bg-[#6a6a6a] p-6">
                    <h3 className="text-[18px] font-semibold">
                      Payment Summary
                    </h3>
                    <div className="mt-6 space-y-4 text-[18px] text-[#ececec]">
                      <div className="flex justify-between">
                        <span>Service Fee</span>
                        <span>{formatCurrency(detail.serviceFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Facility Tax</span>
                        <span>{formatCurrency(detail.facilityTax)}</span>
                      </div>
                      {detail.additionalCosts.map((cost) => (
                        <div className="flex justify-between" key={cost._id}>
                          <span>{cost.name}</span>
                          <span>{formatCurrency(cost.amount)}</span>
                        </div>
                      ))}
                      <div className="border-t border-[#bbbbbb] pt-4 text-[#ffc737]">
                        <div className="flex justify-between font-semibold">
                          <span>Total Payment</span>
                          <span>
                            {formatCurrency(
                              (detail.serviceFee ?? 0) +
                                (detail.facilityTax ?? 0) +
                                detail.additionalCosts.reduce(
                                  (sum, cost) => sum + cost.amount,
                                  0,
                                ),
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[#4d4d4d] p-5">
                <div className="flex items-center gap-4">
                  <Avatar
                    className="size-16"
                    name={detail.customer.name}
                    src={detail.customer.avatar}
                  />
                  <div>
                    <p className="text-[20px] font-semibold">
                      {detail.customer.name}
                    </p>
                    <p className="text-[#b9b9b9]">{detail.customer.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setSelectedId(null)} variant="surface">
                    Back
                  </Button>
                  <Button
                    onClick={() => statusMutation.mutate("cancelled")}
                    variant="danger"
                  >
                    Cancel Request
                  </Button>
                  <div className="min-w-[220px]">
                    <Select
                      className="h-12"
                      disabled={statusMutation.isPending}
                      onChange={(event) =>
                        handleStatusChange(event.target.value)
                      }
                      value={detail.status}
                    >
                      {SERVICE_REQUEST_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                <div className="rounded-[24px] border border-[#4d4d4d] p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-3 block text-[18px]">
                        Technician
                      </label>
                      <Select
                        onChange={(event) =>
                          setAssignForm((current) => ({
                            ...current,
                            technicianId: event.target.value,
                          }))
                        }
                        value={assignForm.technicianId}
                      >
                        <option value="">Select technician</option>
                        {technicians.map((technician) => (
                          <option key={technician._id} value={technician._id}>
                            {technician.name} -{" "}
                            {technician.serviceName || technician.service}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <label className="mb-3 block text-[18px]">Problem</label>
                      <Textarea value={detail.problemDescription} readOnly />
                    </div>
                  </div>

                  <div className="mt-6 rounded-[20px] border border-[#4d4d4d] p-4">
                    <h3 className="text-[18px] font-semibold">
                      Evidence & Context
                    </h3>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      {detail.evidencePhotos.map((photo, index) => (
                        <div
                          className="h-64 rounded-2xl bg-cover bg-center"
                          key={`${photo.url}-${index}`}
                          style={{ backgroundImage: `url(${photo.url})` }}
                        />
                      ))}
                    </div>
                    <div className="mt-6 grid gap-6 md:grid-cols-3">
                      <div>
                        <label className="mb-3 block text-[18px]">
                          Special Instruction
                        </label>
                        <Input
                          value={
                            detail.specialInstruction ||
                            "No special instructions"
                          }
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="mb-3 block text-[18px]">
                          Service Area
                        </label>
                        <div className="relative">
                          <Input
                            value={
                              detail.address.address ||
                              detail.address.street ||
                              "Location unavailable"
                            }
                            readOnly
                          />
                          <MapPin className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-white" />
                        </div>
                      </div>
                      <div>
                        <label className="mb-3 block text-[18px]">
                          Service Type
                        </label>
                        <Input value={detail.serviceType} readOnly />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="mb-4 text-[20px] font-semibold">
                      Fix Booking Schedule for User
                    </h3>
                    <div className="rounded-[20px] bg-[#505050] p-4">
                      <p className="mb-5 text-[18px]">Service Schedule</p>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label className="mb-3 block text-[18px] text-[#f4c542]">
                            Preferred Date
                          </label>
                          <div className="relative">
                            <Input
                              className="border-transparent bg-[#696969]"
                              onChange={(event) =>
                                setAssignForm((current) => ({
                                  ...current,
                                  scheduledDate: event.target.value,
                                }))
                              }
                              placeholder="mm/dd/yyyy"
                              type="date"
                              value={assignForm.scheduledDate}
                            />
                            <CalendarDays className="absolute right-4 top-1/2 size-5 -translate-y-1/2" />
                          </div>
                        </div>
                        <div>
                          <label className="mb-3 block text-[18px] text-[#f4c542]">
                            Preferred Time
                          </label>
                          <div className="relative">
                            <Input
                              className="border-transparent bg-[#696969]"
                              onChange={(event) =>
                                setAssignForm((current) => ({
                                  ...current,
                                  scheduledTime: event.target.value,
                                }))
                              }
                              value={assignForm.scheduledTime}
                            />
                            <Clock3 className="absolute right-4 top-1/2 size-5 -translate-y-1/2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[20px] bg-[#505050] p-4">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-3 block text-[18px]">
                          Service Fee
                        </label>
                        <Input
                          className="border-transparent bg-[#696969]"
                          onChange={(event) =>
                            setAssignForm((current) => ({
                              ...current,
                              serviceFee: Number(event.target.value),
                            }))
                          }
                          type="number"
                          value={assignForm.serviceFee}
                        />
                      </div>
                      <div>
                        <label className="mb-3 block text-[18px]">
                          Facility Tax
                        </label>
                        <Input
                          className="border-transparent bg-[#696969]"
                          onChange={(event) =>
                            setAssignForm((current) => ({
                              ...current,
                              facilityTax: Number(event.target.value),
                            }))
                          }
                          type="number"
                          value={assignForm.facilityTax}
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between rounded-xl border border-[#7a7a7a] p-4">
                      <span>Total Fee</span>
                      <span className="text-[28px] font-semibold text-[#f4c542]">
                        {formatCurrency(totalFee)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#4d4d4d] p-6">
                  <h3 className="mb-5 text-[20px] font-semibold">
                    Assignment Summary
                  </h3>
                  <div className="space-y-4 rounded-[20px] bg-[#2f2f2f] p-5">
                    <p className="text-[18px]">
                      Customer:{" "}
                      <span className="text-[#f4c542]">
                        {detail.customer.name}
                      </span>
                    </p>
                    <p className="text-[18px]">
                      Technician:{" "}
                      <span className="text-[#f4c542]">
                        {technicians.find(
                          (technician) =>
                            technician._id === assignForm.technicianId,
                        )?.name || "Select one"}
                      </span>
                    </p>
                    <p className="text-[18px]">
                      Service Fee: {formatCurrency(assignForm.serviceFee)}
                    </p>
                    <p className="text-[18px]">
                      Facility Tax: {formatCurrency(assignForm.facilityTax)}
                    </p>
                    <p className="border-t border-[#555555] pt-4 text-[22px] font-semibold text-[#f4c542]">
                      Total Fee: {formatCurrency(totalFee)}
                    </p>
                  </div>
                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <Button
                      onClick={() => setSelectedId(null)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => assignMutation.mutate()}>
                      {assignMutation.isPending ? "Assigning..." : "Accept"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-4">
            <div className="h-10 w-56 rounded bg-[#3a3a3a]" />
            <div className="h-96 rounded-3xl bg-[#262626]" />
          </div>
        )}
      </Modal>
    </div>
  );
}
