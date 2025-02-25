"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Plus } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { addCSRNoteAction } from '@/lib/db/actions/users';
import { CSRFormProps } from '@/lib/db/actions/types';
export const csrNoteSchema = z.object({
  userId: z.number(),
  csr_notes: z
    .string()
    .min(10, {
      message: "Note must be at least 10 characters.",
    })
    .max(500, {
      message: "Note must not be longer than 500 characters.",
    }),
});



export function CSRNoteForm({ userDetail, onSuccess }: CSRFormProps) {
  const [ isExpanded, setIsExpanded ] = useState(false);

  const form = useForm<z.infer<typeof csrNoteSchema>>({
    resolver: zodResolver(csrNoteSchema),
    defaultValues: {
      userId: userDetail.user.id,
      csr_notes: userDetail.user.csr_notes || "",
    },
  });

  async function onSubmit(data: z.infer<typeof csrNoteSchema>) {
    const result = await addCSRNoteAction({
      userId: userDetail.user.id,
      csr_notes: data.csr_notes,
    });

    if (result.success) {
      toast.success("Note added successfully");
      form.reset();
      setIsExpanded(false);

      if (onSuccess) {
        onSuccess();
      }
    } else {
      toast.error("Failed to add note");
      console.error(result.errors);
    }
  }

  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-muted-foreground" />
            CSR Notes
          </div>
          {!isExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="h-8 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Note
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isExpanded ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="csr_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={userDetail.user.csr_notes ? "Edit note..." : "Enter a note about this customer..."}
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      This note will be visible to all CSRs and tracked in the customer history.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">Save Note</Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="text-sm text-muted-foreground">
            {userDetail.user.csr_notes ? (
              <div className="p-2 bg-muted rounded-md">
                <p className="text-xs text-foreground whitespace-pre-wrap">{userDetail.user.csr_notes}</p>
              </div>
            ) : (
              <p className="text-center py-2">No notes have been added for this customer.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
