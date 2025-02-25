import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { RefreshCcw } from 'lucide-react';



interface CheckmarkProps {
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        delay: i * 0.2,
        type: "spring",
        duration: 1.5,
        bounce: 0.2,
        ease: "easeInOut",
      },
      opacity: { delay: i * 0.2, duration: 0.2 },
    },
  }),
};


function Checkmark({ size = 100, strokeWidth = 2, color = "currentColor", className = "" }: CheckmarkProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      initial="hidden"
      animate="visible"
      className={className}
    >
      <title>Animated Checkmark</title>
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        stroke={color}
        variants={draw}
        custom={0}
        style={{
          strokeWidth,
          strokeLinecap: "round",
          fill: "transparent",
        }}
      />
      <motion.path
        d="M30 50L45 65L70 35"
        stroke={color}
        variants={draw}
        custom={1}
        style={{
          strokeWidth,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          fill: "transparent",
        }}
      />
    </motion.svg>
  );
}
function SuccessAnimation() {
  return (
    <motion.svg
      width={100}
      height={100}
      viewBox="0 0 100 100"
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        stroke="rgb(16 185 129)"
        variants={draw}
        custom={0}
        style={{
          strokeWidth: 2,
          strokeLinecap: "round",
          fill: "transparent",
        }}
      />
      <motion.path
        d="M30 50L45 65L70 35"
        stroke="rgb(16 185 129)"
        variants={draw}
        custom={1}
        style={{
          strokeWidth: 2,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          fill: "transparent",
        }}
      />
    </motion.svg>
  );
}
interface SuccessCardProps {
  title: string;
  message: string;
  onReset: () => void;
}

export function SuccessCard({ title, message, onReset, }: SuccessCardProps) {
  return (
    <Card >
      <CardContent className="space-y-4 text-center" >
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <SuccessAnimation />
        </motion.div>
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {message}
          </p>
        </motion.div>
        <Button onClick={onReset} className="mt-4">
          <RefreshCcw className="w-4 h-4 mr-2" />
        </Button>
      </CardContent>
    </Card>
  );
}