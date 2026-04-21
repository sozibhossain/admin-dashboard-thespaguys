"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [selectedServiceRequestId, setSelectedServiceRequestId] = useState<string | null>(null);

  const paymentsQuery = useQuery({
    queryKey: ["payments", page],
    queryFn: () => api.getPayments({ page, limit: 10 }),
  });

  const detailQuery = useQuery({
    queryKey: ["payment-service-request", selectedServiceRequestId],
    queryFn: () => api.getServiceRequestDetail(selectedServiceRequestId!),
    enabled: !!selectedServiceRequestId,
  });

  return (
    <div>
      <PageHeader
        title="User Management"
        breadcrumb="Dashboard  >  Service Request"
        actions={
          <div className="grid gap-3 sm:grid-cols-[360px_150px]">
            <div className="relative">
              <Input className="border-[#6e6e6e] bg-[#181818] pr-14" placeholder="Search" />
              <div className="gold-gradient absolute right-0 top-0 flex h-14 w-16 items-center justify-center rounded-r-xl">
                <Search className="size-5" />
              </div>
            </div>
            <Select defaultValue="">
              <option value="">All</option>
            </Select>
          </div>
        }
      />

      <section className="panel-gradient rounded-[24px] border border-[#343434] p-5">
        {paymentsQuery.isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="overflow-x-auto rounded-[24px] border border-[#343434]">
              <table className="min-w-full">
                <thead className="bg-[#2a2a2a] text-left text-[16px] font-medium text-white">
                  <tr>
                    {["User Name", "Technician's Name", "Service", "Location", "Payment", "Status", "Action"].map(
                      (heading) => (
                        <th className="px-6 py-5" key={heading}>
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paymentsQuery.data?.payments.map((payment) => (
                    <tr className="border-t border-[#343434]" key={payment._id}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-11" name={payment.customer.name} />
                          <span>{payment.customer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[#d4d4d4]">
                        {payment.serviceRequest?.serviceType || "Spa Repair Technician"}
                      </td>
                      <td className="px-6 py-5 text-[#d4d4d4]">{payment.type}</td>
                      <td className="px-6 py-5 text-[#d4d4d4]">{payment.customer.email}</td>
                      <td className="px-6 py-5 text-[#d4d4d4]">{formatCurrency(payment.amount)}</td>
                      <td className="px-6 py-5">
                        <StatusBadge value={payment.status} />
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => setSelectedServiceRequestId(payment.serviceRequest._id)}
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
                Showing {(page - 1) * 10 + 1} to {(page - 1) * 10 + (paymentsQuery.data?.payments.length ?? 0)} of {paymentsQuery.data?.total ?? 0} results
              </p>
              <Pagination
                page={page}
                totalPages={Math.max(paymentsQuery.data?.totalPages ?? 1, 1)}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </section>

      <Modal open={!!selectedServiceRequestId} onClose={() => setSelectedServiceRequestId(null)} className="max-w-[1400px]">
        {detailQuery.data?.request ? (
          <div className="grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
            <div>
              <h2 className="mb-8 text-[30px] font-medium">Order summary</h2>
              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-[18px] font-semibold">Presenting Problem</label>
                  <div className="rounded-2xl bg-[#6b6b6b] p-5 text-[18px] text-white">
                    {detailQuery.data.request.presentingProblem || detailQuery.data.request.problemDescription}
                  </div>
                </div>
                <div>
                  <label className="mb-3 block text-[18px] font-semibold">Diagnosis</label>
                  <div className="rounded-2xl bg-[#6b6b6b] p-5 text-[18px] text-white">
                    {detailQuery.data.request.diagnosis || "No diagnosis was added."}
                  </div>
                </div>
                <div>
                  <label className="mb-3 block text-[18px] font-semibold">Post Service Documentation</label>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {(detailQuery.data.request.postServicePhotos?.length
                      ? detailQuery.data.request.postServicePhotos
                      : detailQuery.data.request.evidencePhotos
                    ).map((photo, index) => (
                      <div
                        className="h-28 rounded-2xl bg-cover bg-center"
                        key={`${photo.url}-${index}`}
                        style={{ backgroundImage: `url(${photo.url})` }}
                      />
                    ))}
                  </div>
                </div>
                {detailQuery.data.request.additionalCosts.map((cost) => (
                  <div className="rounded-2xl bg-[#6b6b6b] p-5" key={cost._id}>
                    <div className="flex justify-between">
                      <p className="text-[18px] font-semibold text-[#ffc737]">{cost.name}</p>
                      <p className="text-[18px] font-semibold text-[#ffc737]">
                        {formatCurrency(cost.amount)}
                      </p>
                    </div>
                    <p className="mt-3 text-[16px] text-[#efefef]">{cost.notes || cost.description}</p>
                  </div>
                ))}
                <Button className="h-16 w-full text-[18px]" onClick={() => setSelectedServiceRequestId(null)}>
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
                    name={detailQuery.data.request.assignedTechnician?.name}
                    src={detailQuery.data.request.assignedTechnician?.avatar}
                  />
                  <div>
                    <p className="text-[18px] text-[#ffc737]">
                      {detailQuery.data.request.assignedTechnician?.name || "Unassigned"}
                    </p>
                    <p className="text-sm">
                      ★ {detailQuery.data.request.assignedTechnician?.rating?.average ?? 0} ({detailQuery.data.request.assignedTechnician?.rating?.count ?? 0} reviews)
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-[22px] bg-[#6a6a6a] p-6">
                <h3 className="text-[18px] font-semibold">Payment Summary</h3>
                <div className="mt-6 space-y-4 text-[18px] text-[#ececec]">
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>{formatCurrency(detailQuery.data.request.serviceFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Facility Tax</span>
                    <span>{formatCurrency(detailQuery.data.request.facilityTax)}</span>
                  </div>
                  {detailQuery.data.request.additionalCosts.map((cost) => (
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
                          (detailQuery.data.request.serviceFee ?? 0) +
                            (detailQuery.data.request.facilityTax ?? 0) +
                            detailQuery.data.request.additionalCosts.reduce(
                              (sum, cost) => sum + cost.amount,
                              0,
                            ),
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-[22px] bg-[#6a6a6a] p-6">
                <p className="text-sm text-[#d6d6d6]">Service Date</p>
                <p className="mt-3 text-[18px]">{formatDate(detailQuery.data.request.scheduledDate)}</p>
                <p className="mt-1 text-[#d6d6d6]">{detailQuery.data.request.scheduledTime}</p>
              </div>
            </div>
          </div>
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
