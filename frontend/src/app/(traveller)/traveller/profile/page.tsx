"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { User, Mail, Phone, MapPin, Calendar, Save, Edit2 } from "lucide-react";

interface TravellerProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  travelStyle: string[];
  avatar?: string;
}

const GENDER_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
};

export default function TravellerProfilePage() {
  const [profile, setProfile] = useState<TravellerProfile>({
    id: "usr_1",
    fullName: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    phone: "+91 90000 10001",
    city: "Panaji",
    state: "Goa",
    country: "India",
    dateOfBirth: "1990-05-15",
    gender: "male",
    travelStyle: ["Adventure", "Family"],
    avatar: undefined,
  });

  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    setEditing(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-gray-600">Manage your traveller details and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Avatar & Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your traveller information</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <img
                    src={profile.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(profile.fullName) + "&background=0F4C5C&color=fff"}
                    alt={profile.fullName}
                    className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-sm"
                  />
                  {editing && (
                    <button type="button" className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow ring-1 ring-gray-200 hover:bg-gray-50 transition-colors" aria-label="Change photo">
                      <Edit2 className="h-4 w-4 text-gray-600" />
                    </button>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{profile.fullName}</h2>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)} disabled={!editing}>
                    <Edit2 className="h-3.5 w-3.5 mr-1.5" />Edit Profile
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Member Since</p>
                    <p className="text-sm font-medium text-gray-900">Nov 2026</p>
                  </div>
                  <div className="h-12 w-px bg-gray-100" />
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Trips</p>
                    <p className="text-sm font-medium text-gray-900">0</p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        disabled={!editing}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        disabled={!editing}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        disabled={!editing}
                        placeholder="+91 90000 10001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profile.dateOfBirth}
                        onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                        disabled={!editing}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Input
                        id="gender"
                        value={GENDER_LABELS[profile.gender]}
                        onChange={() => {}}
                        disabled
                        readOnly
                        placeholder="Select gender"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profile.city}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                        disabled={!editing}
                        placeholder="City"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={profile.state}
                        onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                        disabled={!editing}
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={profile.country}
                        onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                        disabled={!editing}
                        placeholder="Country"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-medium text-gray-900">Travel Style</Label>
                    <p className="text-sm text-gray-500">Select the types of trips you enjoy</p>
                    <div className="flex flex-wrap gap-2">
                      {["Adventure", "Family", "Honeymoon", "Leisure", "Weekend", "Pilgrimage", "Corporate"].map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => {
                            const current = profile.travelStyle.includes(style)
                              ? profile.travelStyle.filter((s) => s !== style)
                              : [...profile.travelStyle, style];
                            setProfile({ ...profile, travelStyle: current });
                          }}
                          disabled={!editing}
                          className={cn(
                            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors border",
                            profile.travelStyle.includes(style)
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              </CardContent>

              {editing ? (
                <CardFooter className="border-t border-gray-100">
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </div>
                </CardFooter>
              ) : (
                <CardFooter className="border-t border-gray-100">
                  <Button variant="outline" onClick={() => setEditing(true)} className="w-full">
                    <Edit2 className="h-3.5 w-3.5 mr-1.5" />Edit Profile
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </>
  );
}
