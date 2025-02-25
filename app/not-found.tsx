import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
          404: Not Found
        </h1>
        <p className="text-muted-foreground max-w-[600px] text-lg">
          Sorry, we couldn&apos;t find the requested resource. The user ID might be
          invalid or no longer exists.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex h-10 items-center justify-center rounded-md
          bg-primary px-8 text-sm font-medium text-primary-foreground
          transition-colors hover:bg-primary/90"
      >
        Return to Home
      </Link>
    </div>
  );
}