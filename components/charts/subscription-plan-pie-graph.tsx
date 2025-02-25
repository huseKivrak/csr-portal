'use client';

import { useMemo } from 'react';
import { Label, Pie, PieChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

interface PieGraphProps {
  subscriptionPlanCount: { plan: string; count: number; }[];
}

const chartConfig = {
  count: {
    label: 'Subscriptions',
    color: '#000000'
  },
  bronze: {
    label: 'Bronze',
    color: '#b87333'
  },
  silver: {
    label: 'Silver',
    color: '#a8a8a8'
  },
  gold: {
    label: 'Gold',
    color: '#d4af37'
  },
  platinum: {
    label: 'Platinum',
    color: '#d3d3d3'
  }
} satisfies ChartConfig;

export function SubscriptionPlanPieGraph({ subscriptionPlanCount }: PieGraphProps) {
  const chartData = useMemo(() => {
    return subscriptionPlanCount.map(subPlan => ({
      plan: subPlan.plan,
      count: subPlan.count,
      fill: subPlan.plan !== 'count' && chartConfig[ subPlan.plan as keyof typeof chartConfig ].color
    }));
  }, [ subscriptionPlanCount ]);

  const totalSubscriptions = useMemo(() => {
    return subscriptionPlanCount.reduce((acc, curr) => acc + curr.count, 0);
  }, [ subscriptionPlanCount ]);

  return (
    <Card className='flex flex-col  w-fit' >
      <CardHeader className='pb-0'>
        <CardDescription className=''>
          Current plan distribution
        </CardDescription>
      </CardHeader>
      <CardContent className='p-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[360px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey='count'
              nameKey='plan'
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 24}
                          className='fill-muted-foreground'
                        >
                          Total:
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 8}
                          className='fill-foreground text-3xl font-bold'

                        >
                          {totalSubscriptions.toLocaleString()}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}