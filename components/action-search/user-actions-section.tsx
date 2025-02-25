'use client';
import { useState } from "react";
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { UserDetail } from "@/db/types";
import { UserForm } from "../forms/user-form";
import { FormWrapper } from '../forms/form-wrapper';
import { Car, CreditCard, IdCard, UserCog2, Users2 } from 'lucide-react';
import { DataTableSkeleton } from '../data-table/data-table-skeleton';
import { columns } from '@/app/(csr)/users/columns';
import { ColumnDef } from '@tanstack/react-table';
import { useHotkeys } from 'react-hotkeys-hook';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';

const ActionSearchBar = dynamic(
  () => import('../action-search/action-search-bar').then(mod => mod.ActionSearchBar),
  {
    ssr: false,
    loading: () => <DataTableSkeleton />
  }
);
const SubscriptionForm = dynamic(
  () => import('../forms/subscription-form').then(mod => mod.SubscriptionForm),
  {
    ssr: false,
    loading: () => <DataTableSkeleton />
  }
);
const TransferSubscriptionForm = dynamic(
  () => import('../forms/transfer-subscription-form').then(mod => mod.TransferSubscriptionForm),
  {
    ssr: false,
    loading: () => <DataTableSkeleton />
  }
);
const PaymentMethodForm = dynamic(
  () => import('../forms/payment-method-form').then(mod => mod.PaymentMethodForm),
  {
    ssr: false,
    loading: () => <DataTableSkeleton />
  }
);
const VehicleForm = dynamic(
  () => import('../forms/vehicle-form').then(mod => mod.VehicleForm),
  {
    ssr: false,
    loading: () => <DataTableSkeleton />
  }
);

const DataTable = dynamic(
  () => import('@/components/data-table/data-table').then(mod => mod.DataTable),
  {
    ssr: false,
    loading: () => <DataTableSkeleton />
  }
);

const baseItems = [
  {
    id: '1',
    label: 'Add Subscription',
    value: 'subscription-form',
    description: 'Add a new subscription',
    icon: <IdCard className="text-blue-500" />,
    hotkey: 'shift+1'
  },
  {
    id: '2',
    label: 'Transfer Subscription',
    value: 'transfer-form',
    description: 'Transfer subscription to another vehicle',
    icon: <IdCard className="text-yellow-500" />,
    hotkey: 'shift+2'
  },
  {
    id: '3',
    label: 'Add Payment Method',
    value: 'payment-method-form',
    description: 'Update payment method information',
    icon: <CreditCard className="text-green-500" />,
    hotkey: 'shift+3'
  },
  {
    id: '4',
    label: 'Add Vehicle',
    value: 'vehicle-form',
    description: 'Add a new vehicle',
    icon: <Car className="text-red-500" />,
    hotkey: 'shift+4'
  },
  {
    id: '5',
    label: 'Edit Account Details',
    value: 'user-form',
    description: 'Edit account details',
    icon: <UserCog2 className="text-blue-500" />,
    hotkey: 'shift+5'
  },
];

export function UserActionsSection({ userDetail }: { userDetail: UserDetail; }) {
  const [ selectedAction, setSelectedAction ] = useState<string | null>(null);
  const [ enableHotkeys, setEnableHotkeys ] = useState(false);

  // Initialize hotkeys for each action
  baseItems.forEach(item => {
    useHotkeys(
      item.hotkey,
      () => {
        setSelectedAction(item.value);
      },
      { enabled: enableHotkeys }
    );
  });

  const router = useRouter();

  const handleActionSelect = (action: any) => {
    if (action.isRedirect) {
      router.push(action.redirectUrl);
    } else {
      setSelectedAction(action.value);
    }
  };

  // Render the appropriate form based on selected action
  const renderForm = (onSuccess: () => void) => {
    switch (selectedAction) {
      case 'subscription-form':
        return <SubscriptionForm userDetail={userDetail} onSuccess={() => {
          onSuccess();
          setSelectedAction(null);
        }} />;
      case 'users-table':
        return <DataTable columns={columns as ColumnDef<unknown, unknown>[]} data={[ userDetail ]} />;
      case 'transfer-form':
        return <TransferSubscriptionForm userDetail={userDetail} onSuccess={() => {
          onSuccess();
          setSelectedAction(null);
        }} />;
      case 'payment-method-form':
        return <PaymentMethodForm userDetail={userDetail} onSuccess={() => {
          onSuccess();
          setSelectedAction(null);
        }} />;
      case 'vehicle-form':
        return <VehicleForm userDetail={userDetail} onSuccess={() => {
          onSuccess();
          setSelectedAction(null);
        }} />;
      case 'user-form':
        return <UserForm userDetail={userDetail} onSuccess={() => {
          onSuccess();
          setSelectedAction(null);
        }} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-background pb-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <ActionSearchBar
              actions={baseItems}
              onActionSelect={handleActionSelect}
            />
          </div>
          <div className="flex items-center gap-2 min-w-fit">
            <Switch
              id="hotkey-mode"
              onClick={() => setEnableHotkeys((prev) => !prev)}
            />
            <Label
              htmlFor="hotkey-mode"
              className="text-sm text-muted-foreground whitespace-nowrap"
            >
              Enable Hotkeys
            </Label>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {selectedAction ? (
          <FormWrapper
            successTitle="Success"
            successMessage="The action has been completed successfully"
            showSuccessCard={true}
          >
            {(onSuccess) => renderForm(onSuccess)}
          </FormWrapper>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <p>Select an action from the search bar above or use hotkeys if enabled</p>
          </div>

        )}
      </div>
    </div>
  );
}
