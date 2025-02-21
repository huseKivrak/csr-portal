import { SelectSubscription } from "@/db/types";
import { Badge } from "./ui/badge";

interface SubscriptionBadgeProps {
  subscriptions: SelectSubscription[];
}

export function SubscriptionBadge({ subscriptions }: SubscriptionBadgeProps) {
  const overdueCount = subscriptions.filter(sub => sub.status === 'overdue').length;
  const activeCount = subscriptions.length - overdueCount;

  // If we have both overdue and active subscriptions
  if (overdueCount > 0 && activeCount > 0) {
    return (
      <Badge variant="mixed-indicator">
        OVERDUE
        <span>{overdueCount}/{subscriptions.length}</span>
      </Badge>
    );
  }

  // If all are overdue
  if (overdueCount > 0) {
    return (
      <Badge variant="destructive-indicator">
        OVERDUE
        <span>{overdueCount}</span>
      </Badge>
    );
  }

  // If all are active
  return (
    <Badge variant="success-indicator">
      ACTIVE
      <span>{subscriptions.length}</span>
    </Badge>
  );
}