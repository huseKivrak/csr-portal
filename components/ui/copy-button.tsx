import { LucideClipboard } from 'lucide-react';
import { Button } from './button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function CopyButton({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <Button
      variant='outline'
      size='icon'
      onClick={() => {
        navigator.clipboard.writeText(content);
        toast.success(`"${content}" copied to clipboard.`);
      }}
      className={cn('ml-1 h-6 w-6', className)}
    >
      <LucideClipboard className='w-3 h-3' />
      <span className='sr-only'>Copy</span>
    </Button>
  );
}
