"use client";

import { AutoComplete, type Option } from "./ui/autocomplete";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Users2 } from "lucide-react";

export function UsersAutocomplete({
  users,
  className,
}: {
  users: { name: string; id: number; }[];
  className?: string;
}) {
  console.log("users:", users);
  const [ isLoading, setLoading ] = useState(false);
  const [ isDisabled, setDisbled ] = useState(false);
  const [ value, setValue ] = useState<Option>();
  const router = useRouter();

  const options: Option[] = users.map((user) => ({
    value: user.id.toString(),
    label: user.name,
    id: user.id.toString(),
  }));

  const handleOptionSelect = (option: Option) => {
    router.push(`/users/${option.value}`);
  };

  return (
    <div className={cn(
      "w-full max-w-3xl",
      className
    )}>

      <div className="max-w-xl">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
          <div className="flex items-center gap-2">
            <Users2 className='text-blue-500' />
            User Search
          </div>
        </h2>

        <div className="relative">
          <AutoComplete
            options={options}
            emptyMessage="No customers found."
            placeholder="Search by name..."
            isLoading={isLoading}
            onValueChange={setValue}
            value={value}
            disabled={isDisabled}
            onOptionSelect={handleOptionSelect}
          />
        </div>
      </div>

      <div className="mt-4 ml-2 text-sm text-muted-foreground">
        {users.length > 0 && (
          <p>{users.length} customers available</p>
        )}
      </div>
    </div>
  );
}
