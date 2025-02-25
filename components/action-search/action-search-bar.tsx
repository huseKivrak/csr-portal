"use client";


import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Send,
} from "lucide-react";
import useDebounce from "@/hooks/use-debounce";
import { SearchAction } from '@/lib/db/actions/types';


export type SearchItem = {
  id: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
  hotkey?: string;
  end?: string;
} & (
    | { isRedirect: true, redirectUrl: string; }
    | { isRedirect?: false, redirectUrl?: string; }
  );
interface SearchResult {
  actions: SearchItem[];
}

export type ActionSearchBarProps = {
  actions: SearchItem[];
  onActionSelect: (action: SearchAction) => void;
  title?: string;
  placeholder?: string;
  defaultOpen?: boolean;
};

/**
 * Generic Action Search Bar
 * @see {@link https://kokonutui.com/docs/components/action-search-bar}
 */
export function ActionSearchBar({
  actions,
  onActionSelect,
  title = 'Quick Actions',
  placeholder = 'What do you need help with?',
  defaultOpen = false,
}: ActionSearchBarProps) {


  const [ query, setQuery ] = useState("");
  const [ result, setResult ] = useState<SearchResult | null>(null);
  const [ isFocused, setIsFocused ] = useState(defaultOpen);
  const debouncedQuery = useDebounce(query, 200);

  useEffect(() => {
    if (!isFocused) {
      setResult(null);
      return;
    }

    if (!debouncedQuery) {
      setResult({ actions });
      return;
    }


    const normalizedQuery = debouncedQuery.toLowerCase().trim();
    const filteredActions = actions.filter((action) => {

      //search all action text
      const searchableText = `${action.label} ${action.description || ''}`
        .toLowerCase();
      return searchableText.includes(normalizedQuery);
    });

    setResult({ actions: filteredActions });
  }, [ debouncedQuery, isFocused, actions ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const container = {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: {
        height: {
          duration: 0.4,
        },
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: {
          duration: 0.3,
        },
        opacity: {
          duration: 0.2,
        },
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <label
          className="font-medium mb-1 ml-2 block"
          htmlFor="search"
        >
          {title}
        </label>
        <div className="relative">
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className="pl-3 pr-9 py-1.5 h-9 text-sm rounded-lg focus-visible:ring-offset-0"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4">
            <AnimatePresence mode="popLayout">
              {query.length > 0 ? (
                <motion.div
                  key="send"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Send className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="search"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {isFocused && result && (
            <motion.div
              className="absolute left-0 right-0 top-full mt-1 z-50 border rounded-md shadow-lg dark:border-gray-800 bg-white dark:bg-black"
              variants={container}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <motion.ul className="max-h-[300px] overflow-y-auto">
                {result.actions.map((action) => (
                  <motion.li
                    key={action.id}
                    className="px-3 py-2 flex items-center justify-between hover:bg-gray-200 dark:hover:bg-zinc-900 cursor-pointer rounded-md"
                    variants={item}
                    layout
                    onClick={() => {
                      onActionSelect(action as SearchAction);
                      setIsFocused(false);
                      setQuery("");
                    }}
                  >
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">
                          {action.icon}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {action.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {action.description}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {action.hotkey}
                      </span>
                      <span className="text-xs text-gray-400 text-right">
                        {action.end}
                      </span>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActionSearchBar;
