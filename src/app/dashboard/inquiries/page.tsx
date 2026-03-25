"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/Loading";
import { useAppStore } from "@/store/useAppStore";
import { apiService } from "@/lib/api";
import { Inquiry, InquiryStatus } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Search,
  Download,
  Phone,
  MessageCircle,
  Users,
  Package,
  ChevronDown,
} from "lucide-react";
import * as XLSX from "xlsx";

const STATUS_CONFIG: Record<
  InquiryStatus,
  { label: string; bg: string; text: string }
> = {
  PENDING: { label: "Pending", bg: "bg-yellow-100", text: "text-yellow-700" },
  REVIEWED: { label: "Reviewed", bg: "bg-blue-100", text: "text-blue-700" },
  RESOLVED: { label: "Resolved", bg: "bg-green-100", text: "text-green-700" },
};

const ALL_STATUSES: InquiryStatus[] = [
  "PENDING",
  "REVIEWED",
  "RESOLVED",
];

export default function InquiriesPage() {
  const { addToast } = useAppStore();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "ALL">(
    "ALL"
  );
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => setOpenDropdownId(null);
    if (openDropdownId) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [openDropdownId]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllInquiries();
      setInquiries(Array.isArray(data) ? data : data.data || []);
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to fetch inquiries",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: InquiryStatus) => {
    setUpdatingId(id);
    setOpenDropdownId(null);
    try {
      await apiService.updateInquiryStatus(id, newStatus);
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
      );
      addToast("Status updated successfully", "success");
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to update status",
        "error"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredInquiries = inquiries.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm) ||
      (item.whatsapp && item.whatsapp.includes(searchTerm)) ||
      (item.package?.titleEn &&
        item.package.titleEn.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportExcel = () => {
    const exportData = filteredInquiries.map((inq) => ({
      Name: inq.name,
      Phone: inq.phone,
      WhatsApp: inq.whatsapp || "-",
      Travelers: inq.travelers,
      Package: inq.package?.titleEn || inq.packageId,
      Status: inq.status,
      "Created At": inq.createdAt
        ? formatDateTime(inq.createdAt)
        : "-",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inquiries");

    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(
        key.length,
        ...exportData.map((row) =>
          String((row as Record<string, unknown>)[key] || "").length
        )
      ) + 2,
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(
      wb,
      `jawla-inquiries-${new Date().toISOString().split("T")[0]}.xlsx`
    );
    addToast("Exported to Excel successfully", "success");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Inquiries</h1>
            <p className="text-neutral-600 mt-1">
              Manage customer package inquiries
            </p>
          </div>
          <button
            onClick={handleExportExcel}
            disabled={filteredInquiries.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            Export to Excel
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
              size={20}
            />
            <Input
              placeholder="Search by name, phone, or package..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as InquiryStatus | "ALL")
            }
            className="input-base w-full sm:w-48"
          >
            <option value="ALL">All Statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ALL_STATUSES.map((status) => {
            const count = inquiries.filter((i) => i.status === status).length;
            const config = STATUS_CONFIG[status];
            return (
              <button
                key={status}
                onClick={() =>
                  setStatusFilter(statusFilter === status ? "ALL" : status)
                }
                className={`p-4 rounded-xl border transition-all ${
                  statusFilter === status
                    ? "border-primary-500 ring-2 ring-primary-100"
                    : "border-neutral-200 hover:border-neutral-300"
                } bg-white`}
              >
                <p className="text-2xl font-bold text-neutral-900">{count}</p>
                <p
                  className={`text-sm font-medium ${config.text}`}
                >
                  {config.label}
                </p>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Package
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Travelers
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.map((item) => {
                const statusConf = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
                return (
                  <tr
                    key={item.id}
                    className="border-t border-neutral-200 hover:bg-neutral-50"
                  >
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-neutral-900">
                        {item.name}
                      </p>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-neutral-700">
                          <Phone size={14} className="text-neutral-400" />
                          <span dir="ltr">{item.phone}</span>
                        </div>
                        {item.whatsapp && (
                          <div className="flex items-center gap-1.5 text-sm text-green-700">
                            <MessageCircle
                              size={14}
                              className="text-green-500"
                            />
                            <a
                              href={`https://wa.me/${item.whatsapp.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                              dir="ltr"
                            >
                              {item.whatsapp}
                            </a>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Package */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-neutral-400" />
                        <span className="text-sm text-neutral-700 max-w-[200px] truncate">
                          {item.package?.titleEn || item.packageId}
                        </span>
                      </div>
                    </td>

                    {/* Travelers */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Users size={16} className="text-neutral-400" />
                        <span className="text-sm font-medium text-neutral-700">
                          {item.travelers}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(
                              openDropdownId === item.id ? null : item.id
                            );
                          }}
                          disabled={updatingId === item.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${statusConf.bg} ${statusConf.text} hover:opacity-80 disabled:opacity-50`}
                        >
                          {updatingId === item.id ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              {statusConf.label}
                              <ChevronDown size={14} />
                            </>
                          )}
                        </button>

                        {openDropdownId === item.id && (
                          <div className="absolute z-50 mt-1 w-40 bg-white rounded-lg shadow-lg border border-neutral-200 py-1">
                            {ALL_STATUSES.map((s) => (
                              <button
                                key={s}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(item.id, s);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 transition-colors ${
                                  item.status === s
                                    ? "font-semibold text-primary-600"
                                    : "text-neutral-700"
                                }`}
                              >
                                <span
                                  className={`inline-block w-2 h-2 rounded-full mr-2 ${STATUS_CONFIG[s].bg.replace("100", "500")}`}
                                />
                                {STATUS_CONFIG[s].label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-neutral-600 text-sm whitespace-nowrap">
                      {item.createdAt
                        ? formatDateTime(item.createdAt)
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredInquiries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-600">No inquiries found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
