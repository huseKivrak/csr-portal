const Skeleton = ({ className }: { className: string; }) => (
  <div aria-live="polite" aria-busy="true" className={className}>
    <span className="inline-flex w-full animate-pulse select-none rounded-md bg-gray-300 leading-none">
      ‌
    </span>
    <br />
  </div>
);

const SVGSkeleton = ({ className }: { className: string; }) => (
  <svg
    className={
      className + " animate-pulse rounded bg-gray-300"
    }
  />
);

export const ChartSkeleton = () => (
  <>
    <div className="border flex flex-col w-fit">
      <div className="flex flex-col space-y-1.5 p-6 pb-0">
        <div className="leading-none tracking-tight">
          <Skeleton className="w-[144px] max-w-full" />
        </div>
        <div>
          <Skeleton className="w-[200px] max-w-full" />
        </div>
      </div>
      <div className="p-0">
        <div className="flex justify-center [&amp;_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&amp;_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&amp;_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&amp;_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&amp;_.recharts-reference-line_[stroke='#ccc']]:stroke-border mx-auto aspect-square max-h-[360px]">
          <style>
            <Skeleton className="w-[2656px] max-w-full" />
          </style>
          <div className="recharts-responsive-container">
            <div>
              <SVGSkeleton className="w-[197px] h-[197px]" />
              <div className="recharts-tooltip-wrapper"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);