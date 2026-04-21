"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import { parseNameParts } from "@/lib/utils";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"personal" | "password">("personal");
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: api.getProfile,
  });
  const settingsQuery = useQuery({
    queryKey: ["platform-settings"],
    queryFn: api.getSettings,
  });

  const nameParts = useMemo(
    () => parseNameParts(profileQuery.data?.user.name),
    [profileQuery.data?.user.name],
  );

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const profileMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append(
        "name",
        `${profileForm.firstName || nameParts.firstName} ${
          profileForm.lastName || nameParts.lastName
        }`.trim(),
      );
      formData.append("email", profileForm.email || profileQuery.data?.user.email || "");
      formData.append("phone", profileForm.phone || profileQuery.data?.user.phone || "");
      return api.updateProfile(formData);
    },
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const passwordMutation = useMutation({
    mutationFn: () => api.changePassword(passwordForm),
    onSuccess: () => {
      toast.success("Password changed");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <div>
      <PageHeader title="Settings" breadcrumb="Dashboard  >  Settings" />

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <button
          className={`h-14 rounded-2xl border text-[18px] font-semibold ${
            activeTab === "personal"
              ? "gold-gradient border-[#f4c542] text-white"
              : "border-[#d4a100] bg-[#2f2a1a] text-[#d4a100]"
          }`}
          onClick={() => setActiveTab("personal")}
          type="button"
        >
          Personal Information
        </button>
        <button
          className={`h-14 rounded-2xl border text-[18px] font-semibold ${
            activeTab === "password"
              ? "gold-gradient border-[#f4c542] text-white"
              : "border-[#d4a100] bg-[#2f2a1a] text-[#d4a100]"
          }`}
          onClick={() => setActiveTab("password")}
          type="button"
        >
          Change Password
        </button>
      </div>

      <div className="panel-gradient mb-6 rounded-[24px] border border-[#343434] p-6">
        {profileQuery.isLoading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="size-28 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-52" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <Avatar className="size-28" name={profileQuery.data?.user.name} src={profileQuery.data?.user.avatar} />
            <div>
              <p className="text-[28px] font-medium">{profileQuery.data?.user.name}</p>
              <p className="text-[18px] text-[#b7b7b7]">Super admin</p>
            </div>
          </div>
        )}
      </div>

      <section className="panel-gradient rounded-[24px] border border-[#343434] p-6">
        {activeTab === "personal" ? (
          <div>
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-[22px] font-semibold">Personal Information</h2>
              <Button variant="primary">
                <Pencil className="mr-2 size-4" />
                Edit
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-3 block text-[18px]">First Name</label>
                <Input
                  className="border-[#6e6e6e] bg-[#0f0f0f]"
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, firstName: event.target.value }))
                  }
                  value={profileForm.firstName || nameParts.firstName}
                />
              </div>
              <div>
                <label className="mb-3 block text-[18px]">Last Name</label>
                <Input
                  className="border-[#6e6e6e] bg-[#0f0f0f]"
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, lastName: event.target.value }))
                  }
                  value={profileForm.lastName || nameParts.lastName}
                />
              </div>
              <div>
                <label className="mb-3 block text-[18px]">Email Address</label>
                <Input
                  className="border-[#6e6e6e] bg-[#0f0f0f]"
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, email: event.target.value }))
                  }
                  value={profileForm.email || profileQuery.data?.user.email || ""}
                />
              </div>
              <div>
                <label className="mb-3 block text-[18px]">Phone</label>
                <Input
                  className="border-[#6e6e6e] bg-[#0f0f0f]"
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  value={profileForm.phone || profileQuery.data?.user.phone || ""}
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={() => profileMutation.mutate()}>
                {profileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-[22px] font-semibold">Change Password</h2>
              <Button variant="primary">
                <Pencil className="mr-2 size-4" />
                Edit
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="mb-3 block text-[18px]">Current Password</label>
                <div className="relative">
                  <Input
                    className="border-[#6e6e6e] bg-[#0f0f0f] pr-12"
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        currentPassword: event.target.value,
                      }))
                    }
                    type={showPasswords.currentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8f8f8f] hover:text-white"
                    onClick={() => setShowPasswords((s) => ({ ...s, currentPassword: !s.currentPassword }))}
                    type="button"
                  >
                    {showPasswords.currentPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-3 block text-[18px]">New Password</label>
                <div className="relative">
                  <Input
                    className="border-[#6e6e6e] bg-[#0f0f0f] pr-12"
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        newPassword: event.target.value,
                      }))
                    }
                    type={showPasswords.newPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8f8f8f] hover:text-white"
                    onClick={() => setShowPasswords((s) => ({ ...s, newPassword: !s.newPassword }))}
                    type="button"
                  >
                    {showPasswords.newPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-3 block text-[18px]">Confirm New Password</label>
                <div className="relative">
                  <Input
                    className="border-[#6e6e6e] bg-[#0f0f0f] pr-12"
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        confirmPassword: event.target.value,
                      }))
                    }
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8f8f8f] hover:text-white"
                    onClick={() => setShowPasswords((s) => ({ ...s, confirmPassword: !s.confirmPassword }))}
                    type="button"
                  >
                    {showPasswords.confirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-between gap-4 rounded-2xl bg-[#202020] p-5">
              <div>
                <p className="text-sm text-[#b7b7b7]">Platform Tax Rate</p>
                <p className="mt-2 text-[20px] font-medium">
                  {settingsQuery.data?.settings.taxRate ?? 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#b7b7b7]">Maintenance Mode</p>
                <p className="mt-2 text-[20px] font-medium">
                  {settingsQuery.data?.settings.maintenanceMode ? "On" : "Off"}
                </p>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={() => passwordMutation.mutate()}>
                {passwordMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
