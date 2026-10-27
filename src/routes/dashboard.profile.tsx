import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readProfile, readSession, saveProfile, type StaffProfile } from "@/lib/auth";
import { PageTitle } from "./dashboard";

export const Route = createFileRoute("/dashboard/profile")({ component: ProfilePage });

function ProfilePage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [profile, setProfile] = useState<StaffProfile>({ phone: "", address: "", cnic: "" });
  useEffect(() => {
    const session = readSession();
    if (!session) return;
    setEmail(session.email);
    setRole(session.role);
    setName(session.name);
    setProfile(readProfile(session.email));
  }, []);
  if (!email) return null;
  const save = () => {
    if (name.trim().length < 2) return toast.error("Enter a name");
    saveProfile(email, profile, name.trim());
    toast.success("Profile saved in this browser");
  };
  return (
    <>
      <PageTitle title="My profile" sub="This is the staff profile from the hospital desk: name, contact, and identity number. The password stays on the login that created the account." />
      <div className="max-w-xl rounded-xl border bg-card p-6">
        <div className="grid gap-3">
          <div><Label htmlFor="pn">Name</Label><Input id="pn" className="mt-1" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Email</Label><Input className="mt-1" value={email} readOnly /></div>
          <div><Label>Desk</Label><Input className="mt-1" value={role} readOnly /></div>
          <div><Label htmlFor="pp">Phone</Label><Input id="pp" className="mt-1" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
          <div><Label htmlFor="pc">CNIC / ID number</Label><Input id="pc" className="mt-1" value={profile.cnic} onChange={(e) => setProfile({ ...profile, cnic: e.target.value })} /></div>
          <div><Label htmlFor="pa">Address</Label><Input id="pa" className="mt-1" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} /></div>
        </div>
        <Button className="mt-5" onClick={save}>Save profile</Button>
      </div>
    </>
  );
}
