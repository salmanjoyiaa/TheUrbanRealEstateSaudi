"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import { PhoneInput } from "@/components/ui/phone-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export type AccountProfileData = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  agent_type?: string | null;
};

type AccountProfileFormProps = {
  initial: AccountProfileData;
  roleLabel: string;
  pageTitle?: string;
  pageSubtitle?: string;
};

function getInitials(name?: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AccountProfileForm({ initial, roleLabel, pageTitle, pageSubtitle }: AccountProfileFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [fullName, setFullName] = useState(initial.full_name);
  const [phone, setPhone] = useState(initial.phone || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatar_url);
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const avatarValues = avatarUrl ? [avatarUrl] : [];

  const handleAvatarChange = (values: string[]) => {
    setAvatarUrl(values[0] ?? null);
  };

  const saveProfile = async () => {
    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    if (phone && !/^\+\d{10,15}$/.test(phone)) {
      toast.error("Phone must be in format +966XXXXXXXXX");
      return;
    }

    setSavingProfile(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: trimmedName,
          phone: phone || "",
          avatar_url: avatarUrl,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }
      toast.success("Profile updated");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{pageTitle ?? "Profile"}</h1>
        <p className="text-sm text-muted-foreground">{pageSubtitle ?? "Manage your account details and security settings."}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile photo</CardTitle>
          <CardDescription>Upload a photo that appears in your account menu.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-lg font-bold text-primary-foreground">
                {getInitials(fullName)}
              </span>
            )}
            <div className="text-sm text-muted-foreground">
              Recommended: square image, at least 200×200px.
            </div>
          </div>
          <ImageUploader
            bucket="avatars"
            values={avatarValues}
            onChange={handleAvatarChange}
            maxFiles={1}
            pathPrefix={initial.id}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal info</CardTitle>
          <CardDescription>Update your display name and contact number.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={100}
            />
          </div>
          <PhoneInput
            value={phone}
            onChange={setPhone}
            label="Phone / WhatsApp"
            showHelper
          />
          <Button onClick={saveProfile} disabled={savingProfile}>
            {savingProfile ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save profile"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your login and membership details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{initial.email}</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <span className="text-muted-foreground">Role</span>
            <Badge variant="secondary" className="capitalize">
              {roleLabel}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium">{formatDate(initial.created_at)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Change your account password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new_password">New password</Label>
            <Input
              id="new_password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm password</Label>
            <Input
              id="confirm_password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
            />
          </div>
          <Button variant="outline" onClick={savePassword} disabled={savingPassword}>
            {savingPassword ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
