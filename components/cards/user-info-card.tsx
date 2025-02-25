'use client';

import { useState } from 'react';
import { Pencil, Calendar, Mail, Phone, MapPin, History, CreditCard, AlertTriangle, CheckCircle2 } from "lucide-react";
import { UserDetail } from "@/db/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { UserForm } from '@/components/forms/user-form';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/copy-button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserActionsSection } from '../action-search/user-actions-section';
import { CSRNoteForm } from '@/components/forms/csr-user-note-form';

export function UserInfoCard({ userDetail }: { userDetail: UserDetail; }) {
  const { is_overdue } = userDetail;
  const [ openEditProfile, setOpenEditProfile ] = useState(false);

  const accountStatus = is_overdue ? 'overdue' : 'active';
  const getStatusBadge = () => {
    switch (accountStatus) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <Card className="w-full px-2 tracking-tight">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-auto">
        <div className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-4 text-2xl">
                <Avatar className="w-10 h-10">
                  <AvatarImage />
                  <AvatarFallback>
                    {userDetail.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {userDetail.user.name}
                <div className="ml-2">{getStatusBadge()}</div>
                <ResponsiveDialog
                  open={openEditProfile}
                  onOpenChange={setOpenEditProfile}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit Profile</span>
                    </Button>
                  }
                >
                  <UserForm
                    userDetail={userDetail}
                    onSuccess={() => setOpenEditProfile(false)}
                  />
                </ResponsiveDialog>
              </CardTitle>

              <CardDescription className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-muted-foreground font-medium">Member Since:</span>
                      <span className="text-foreground truncate">
                        {formatDateTime(userDetail.user.created_at, false).split(',')[ 1 ]}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-muted-foreground font-medium">Last Payment:</span>
                      <span className="text-foreground truncate">
                        {userDetail.payments?.length > 0
                          ? formatDateTime(userDetail.payments[ 0 ].created_at, false)
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <History className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-muted-foreground font-medium">Last Wash:</span>
                      <span className="text-foreground truncate">
                        {userDetail.washes?.length > 0
                          ? formatDateTime(userDetail.washes[ 0 ].created_at, false)
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate text-foreground">
                      {userDetail.user.email}
                    </span>
                    <CopyButton content={userDetail.user.email} />
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground">
                      {userDetail.user.phone || 'Not provided'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground">
                      {userDetail.user.address || 'Not provided'}
                    </span>
                  </div>
                </div>
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {accountStatus === 'overdue' && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Payment Overdue</AlertTitle>
                <AlertDescription>
                  This account has overdue payments. The customer may be unable to use their subscription until payment is resolved.
                </AlertDescription>
              </Alert>
            )}

            {accountStatus === 'active' && (
              <Alert className="border-green-500 mb-4">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-500">Account Active</AlertTitle>
                <AlertDescription>
                  This account is in good standing. Customer has full access to all subscribed services.
                </AlertDescription>
              </Alert>
            )}

            <CSRNoteForm userDetail={userDetail} />
          </CardContent>
        </div>

        <div className="lg:col-span-2 border-l pl-4 pt-4 flex flex-col">
          <UserActionsSection userDetail={userDetail} />
        </div>
      </div>
    </Card>
  );
};