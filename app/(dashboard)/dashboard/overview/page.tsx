"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  type PieLabelRenderProps,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  Eye,
  MessageSquareText,
  SlidersHorizontal,
  Star,
  TrendingUp,
  User,
  UserCog,
  UserSearch,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getChartLabel(id: string | { year?: number; month?: number }) {
  if (typeof id === "string") return id;
  if (id.month) return monthLabels[id.month - 1];
  return `${id.year ?? ""}`;
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="panel-gradient rounded-[20px] border border-[#343434] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Icon className="size-5 text-[#9b9b9b]" />
          <p className="mt-3 text-[14px] text-[#9b9b9b]">{label}</p>
        </div>
        <p className="text-[36px] font-bold leading-none text-white">{value}</p>
      </div>
    </div>
  );
}

function renderPieLabel(props: PieLabelRenderProps) {
  const cx = props.cx as number;
  const cy = props.cy as number;
  const midAngle = props.midAngle as number;
  const outerRadius = props.outerRadius as number;
  const percent = props.percent as number;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text dominantBaseline="central" fill="white" fontSize={12} textAnchor="middle" x={x} y={y}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  const value = Number(payload[0]?.value ?? 0);
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-xl border border-[#3a3a3a] bg-[#1c1c1c] px-4 py-2.5 text-center shadow-lg">
        {label ? (
          <p className="text-[10px] font-medium uppercase tracking-widest text-[#6a6a6a]">{label}</p>
        ) : null}
        <p className="mt-0.5 text-[14px] font-semibold text-white">{formatCurrency(value)}</p>
      </div>
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "7px solid transparent",
          borderRight: "7px solid transparent",
          borderTop: "7px solid #3a3a3a",
        }}
      />
    </div>
  );
}

const tooltipStyle = {
  contentStyle: { background: "#1e1e1e", border: "1px solid #3a3a3a", borderRadius: 8, color: "#fff" },
  labelStyle: { color: "#9b9b9b" },
};

const axisProps = {
  stroke: "transparent",
  tick: { fill: "#7a7a7a", fontSize: 12 },
  tickLine: false,
  axisLine: false,
};

export default function OverviewPage() {
  const statsQuery = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.getDashboardStats,
  });
  const usersChartQuery = useQuery({
    queryKey: ["users-chart"],
    queryFn: api.getUsersChart,
  });
  const techniciansChartQuery = useQuery({
    queryKey: ["technicians-chart"],
    queryFn: api.getTechniciansChart,
  });
  const requestMixQuery = useQuery({
    queryKey: ["service-request-mix"],
    queryFn: api.getServiceRequestsChart,
  });
  const revenueChartQuery = useQuery({
    queryKey: ["revenue-chart"],
    queryFn: api.getRevenueChart,
  });
  const rankingsQuery = useQuery({
    queryKey: ["technician-rankings", 1],
    queryFn: () => api.getTechnicianRankings({ page: 1, limit: 8 }),
  });

  const usersChart =
    usersChartQuery.data?.data.map((item) => ({
      name: getChartLabel(item._id),
      value: item.count ?? 0,
    })) ?? [];

  const technicianChart =
    techniciansChartQuery.data?.data.map((item) => ({
      name: getChartLabel(item._id),
      value: item.count ?? 0,
    })) ?? [];

  const revenueChart =
    revenueChartQuery.data?.data.map((item) => ({
      name: getChartLabel(item._id),
      value: item.revenue ?? 0,
    })) ?? [];

  const requestMix =
    requestMixQuery.data?.data.map((item, index) => ({
      name: item._id,
      value: item.count,
      color: ["#ffd04e", "#c89900", "#8d6a00", "#6f5600", "#3e3000"][index % 5],
    })) ?? [];

  return (
    <div>
      <PageHeader title="Dashboard Overview" breadcrumb="Dashboard  >  Overview" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statsQuery.isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[110px] rounded-[20px]" />
            ))
          : (
            <>
              <StatCard
                icon={User}
                label="Total Users"
                value={String(statsQuery.data?.totalUsers ?? 0)}
              />
              <StatCard
                icon={UserCog}
                label="Total technicians"
                value={String(statsQuery.data?.totalTechnicians ?? 0)}
              />
              <StatCard
                icon={UserSearch}
                label="Total Service Requests"
                value={String(statsQuery.data?.totalServiceRequests ?? 0)}
              />
              <StatCard
                icon={TrendingUp}
                label="Total Revenue"
                value={formatCurrency(statsQuery.data?.totalRevenue)}
              />
            </>
          )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="panel-gradient rounded-[24px] border border-[#343434] p-5">
          <h2 className="text-[20px] font-medium">Total Users</h2>
          <p className="text-sm text-[#8b8b8b]">See your users per year.</p>
          <div className="mt-6 h-[340px]">
            {usersChartQuery.isLoading ? (
              <Skeleton className="h-full rounded-[18px]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usersChart} barCategoryGap="30%">
                  <CartesianGrid stroke="#2e2e2e" vertical={false} />
                  <XAxis dataKey="name" {...axisProps} />
                  <YAxis {...axisProps} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    {...tooltipStyle}
                  />
                  <Bar dataKey="value" fill="#c8a433" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="panel-gradient rounded-[24px] border border-[#343434] p-5">
          <h2 className="text-[20px] font-medium">Total Technicians</h2>
          <p className="text-sm text-[#8b8b8b]">See your total technicians per year.</p>
          <div className="mt-6 h-[340px]">
            {techniciansChartQuery.isLoading ? (
              <Skeleton className="h-full rounded-[18px]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={technicianChart}>
                  <defs>
                    <linearGradient id="techGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#f4c542" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#f4c542" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#2e2e2e" vertical={false} />
                  <XAxis dataKey="name" {...axisProps} />
                  <YAxis {...axisProps} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
                  <Tooltip {...tooltipStyle} />
                  <Area
                    dataKey="value"
                    fill="url(#techGradient)"
                    stroke="#f4c542"
                    strokeWidth={2.5}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.35fr]">
        <section className="panel-gradient rounded-[24px] border border-[#343434] p-5">
          <h2 className="text-[20px] font-medium">Popular Service Requests</h2>
          <p className="text-sm text-[#8b8b8b]">
            See which technicians are requested the most by users.
          </p>
          <div className="mt-4 h-[300px]">
            {requestMixQuery.isLoading ? (
              <Skeleton className="h-full rounded-[18px]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={requestMix}
                    dataKey="value"
                    innerRadius={80}
                    outerRadius={118}
                    paddingAngle={2}
                    label={renderPieLabel}
                    labelLine={false}
                  >
                    {requestMix.map((entry) => (
                      <Cell fill={entry.color} key={entry.name} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] text-[#d4d4d4]">
            {requestMix.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-gradient rounded-[24px] border border-[#343434] p-5">
          <h2 className="text-[20px] font-medium">Revenue Overview</h2>
          <p className="text-sm text-[#8b8b8b]">
            Track total revenue, platform commission, and payouts over time.
          </p>
          <div className="mt-6 h-[400px]">
            {revenueChartQuery.isLoading ? (
              <Skeleton className="h-full rounded-[18px]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChart}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#e8c24c" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#e8c24c" stopOpacity={0.06} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#2e2e2e" vertical={false} />
                  <XAxis dataKey="name" {...axisProps} />
                  <YAxis
                    {...axisProps}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                    }
                  />
                  <Tooltip
                    content={<RevenueTooltip />}
                    cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }}
                  />
                  <Area
                    dataKey="value"
                    fill="url(#revenueGradient)"
                    stroke="#f4c542"
                    strokeWidth={2.5}
                    type="monotone"
                    activeDot={{ r: 5, fill: "#f4c542", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <section className="panel-gradient mt-6 rounded-[24px] border border-[#343434] p-5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[22px] font-semibold">Technician Rankings</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="outline">
              Filter by Status
              <ChevronDown className="ml-2 size-4" />
            </Button>
            <Button size="sm" variant="outline">
              This Month
              <ChevronDown className="ml-2 size-4" />
            </Button>
            <Button size="sm" variant="outline">
              Sort by Earnings
              <SlidersHorizontal className="ml-2 size-4" />
            </Button>
          </div>
        </div>
        {rankingsQuery.isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="overflow-x-auto rounded-[20px] border border-[#2a2a2a]">
              <table className="min-w-full">
                <thead className="bg-[#232323] text-left">
                  <tr>
                    {[
                      "Serial Number",
                      "Technician Name",
                      "Service",
                      "Total Jobs",
                      "Avg Rating",
                      "Status",
                      "Earnings",
                      "Action",
                    ].map((heading) => (
                      <th
                        className="whitespace-nowrap px-6 py-4 text-[15px] font-medium text-white"
                        key={heading}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rankingsQuery.data?.rankings.map((ranking, index) => (
                    <tr className="border-t border-[#2a2a2a]" key={ranking._id}>
                      <td className="px-6 py-4 text-[15px] text-[#d8d8d8]">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            className="size-10"
                            name={ranking.name}
                            src={ranking.avatar}
                          />
                          <span className="text-[15px] text-white">{ranking.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[15px] text-[#d8d8d8]">
                        {ranking.serviceName || ranking.specialization || ranking.service}
                      </td>
                      <td className="px-6 py-4 text-[15px] text-[#d8d8d8]">{ranking.completedJobs}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-[15px] text-[#ffd34e]">
                          <Star className="size-4 fill-current" />
                          <span>{ranking.rating?.average ?? 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "status-pill inline-flex items-center justify-center border text-[13px]",
                            index < 3
                              ? "border-[#2be560] bg-[rgba(43,229,96,0.12)] text-[#2be560]"
                              : index < 6
                                ? "border-[#d07d19] bg-[rgba(208,125,25,0.1)] text-[#d07d19]"
                                : "border-[#ff3030] bg-[rgba(255,48,48,0.1)] text-[#ff3030]",
                          )}
                        >
                          {index < 3 ? "Top Performer" : index < 6 ? "On Track" : "Low Performance"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[15px] text-[#d8d8d8]">
                        {formatCurrency(ranking.totalEarnings)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-[#9b9b9b]">
                          <button className="transition hover:text-white" type="button">
                            <MessageSquareText className="size-5" />
                          </button>
                          <button className="transition hover:text-white" type="button">
                            <Eye className="size-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-[14px] text-[#9b9b9b]">
                Showing 1 to 10 of 500 results
              </p>
              <Pagination
                page={1}
                totalPages={Math.max(rankingsQuery.data?.totalPages ?? 1, 1)}
                onPageChange={() => undefined}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
