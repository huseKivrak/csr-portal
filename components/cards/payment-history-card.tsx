'use client';

import { useState } from 'react';
import { UserDetail } from '@/db/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Receipt, ArrowDown, ArrowUp, Filter } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';

export function PaymentHistoryCard({ userDetail }: { userDetail: UserDetail; }) {
  const { payments } = userDetail;
  const [ dateFilter, setDateFilter ] = useState<Date | undefined>(undefined);
  const [ statusFilter, setStatusFilter ] = useState<string | undefined>(undefined);
  const [ isExpanded, setIsExpanded ] = useState<number | null>(null);

  // Filter payments based on the date and status filters
  const filteredPayments = payments?.filter(payment => {
    const matchesDate = !dateFilter ||
      new Date(payment.created_at).toDateString() === dateFilter.toDateString();
    const matchesStatus = !statusFilter || payment.status === statusFilter;
    return matchesDate && matchesStatus;
  }) || [];

  // Reset filters
  const resetFilters = () => {
    setDateFilter(undefined);
    setStatusFilter(undefined);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="bg-green-500/20 text-green-600 hover:bg-green-500/20">Paid</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="bg-amber-500/20 text-amber-600 hover:bg-amber-500/20">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Purchase History</CardTitle>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  {dateFilter ? formatDateTime(dateFilter, false) : 'Filter Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : 'Filter Status'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <div className="flex flex-col gap-1">
                  <Button
                    variant={statusFilter === 'paid' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setStatusFilter(statusFilter === 'paid' ? undefined : 'paid')}
                  >
                    Paid
                  </Button>
                  <Button
                    variant={statusFilter === 'failed' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setStatusFilter(statusFilter === 'failed' ? undefined : 'failed')}
                  >
                    Failed
                  </Button>
                  <Button
                    variant={statusFilter === 'pending' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setStatusFilter(statusFilter === 'pending' ? undefined : 'pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={statusFilter === 'refunded' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setStatusFilter(statusFilter === 'refunded' ? undefined : 'refunded')}
                  >
                    Refunded
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {(dateFilter || statusFilter) && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          View complete payment history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-4 w-4" />
          <h3 className="font-medium">Payment History</h3>
        </div>

        <ScrollArea className="h-[400px]">
          {filteredPayments.length > 0 ? (
            <div className="space-y-2">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="border rounded-md p-3">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsExpanded(isExpanded === payment.id ? null : payment.id)}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-medium">
                        {payment.item_type === 'subscription'
                          ? 'Subscription Payment'
                          : payment.item_type === 'wash'
                            ? 'Single Wash Purchase'
                            : `Payment #${payment.id}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(payment.created_at, true)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">
                        {formatCurrency(payment.final_amount)}
                      </div>
                      {getStatusBadge(payment.status)}
                      {isExpanded === payment.id ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    </div>
                  </div>

                  {isExpanded === payment.id && (
                    <div className="mt-2 pt-2 border-t text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-muted-foreground">Payment ID:</div>
                        <div>#{payment.id}</div>

                        <div className="text-muted-foreground">Method:</div>
                        <div>Payment Method ID: {payment.payment_method_id}</div>

                        <div className="text-muted-foreground">Base Amount:</div>
                        <div>{formatCurrency(payment.base_amount)}</div>

                        {parseFloat(payment.discount_amount) > 0 && (
                          <>
                            <div className="text-muted-foreground">Discount:</div>
                            <div>{formatCurrency(payment.discount_amount)}</div>
                          </>
                        )}

                        {payment.status === 'failed' && (
                          <>
                            <div className="text-muted-foreground">Failure:</div>
                            <div className="text-red-500">Payment failed</div>
                          </>
                        )}

                        {payment.subscription_id && (
                          <>
                            <div className="text-muted-foreground">Subscription:</div>
                            <div>#{payment.subscription_id}</div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              {dateFilter || statusFilter ?
                "No payments match the current filters" :
                "No payment history available"}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}