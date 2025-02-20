"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";
import { SelectUser } from '@/db/types';

interface UserDetailProps {
  user: SelectUser;
  isLoading?: boolean;
}

export function UserDetail({ user }: UserDetailProps) {
  if (!user) {
    return <div>User not found</div>;
  }

  return (

    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6" />
          {user.name}
        </h1>
        <Badge variant={user.account_status === 'active' ? 'default' : 'destructive'}>
          {user.account_status}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={user.name} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user.email} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={user.phone} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={user.address} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Created At</Label>
                  <Input value={new Date(user.created_at).toLocaleDateString()} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Last updated: {new Date(user.updated_at || user.created_at).toLocaleString()}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>User Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="destructive">Deactivate User</Button>
                <Button variant="secondary">Reset Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

  );
}
