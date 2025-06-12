"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createJournalEntry, updateJournalEntry } from "@/lib/actions";
import type { JournalEntry } from "@/lib/types";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUser } from "@/lib/firebase";

interface JournalFormProps {
  entry?: JournalEntry;
  isEditing?: boolean;
}

export function JournalForm({ entry, isEditing = false }: JournalFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();

  const today = format(new Date(), "yyyy-MM-dd");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user?.uid) {
      setError("User not authenticated");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);

    try {
      let result;

      if (isEditing && entry?.id) {
        result = await updateJournalEntry(
          user.uid,
          entry.id,
          getCurrentUser()?.email || "",
          formData
        );
      } else {
        result = await createJournalEntry(
          user.uid,
          getCurrentUser()?.email || "",
          formData
        );
      }
      console.log("yaha1");
      if (result.success) {
        setSuccess(result.message);
        // if (!isEditing) {
        //   e.currentTarget.reset()
        // }
        // setTimeout(() => {
        //   router.push("/calendar")
        // }, 1500)
      } else {
        setError(result.message || "Failed to save journal entry");
      }
      console.log("yaha2");
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="  py-2 px-0 md:px-2 flex items-center justify-center">
      <Card className="w-full max-w-2xl mx-auto bg-[#29292e] shadow-2xl rounded-2xl border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#10B981] tracking-tight">
            {isEditing ? "Edit Journal Entry" : "New Journal Entry"}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-[#10B981] font-medium">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter a title for your journal entry"
                required
                defaultValue={entry?.title || ""}
                className="bg-[#23272F] border border-[#10B981]/30 text-white placeholder-gray-400 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/40 transition"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-[#10B981] font-medium">
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={
                  entry?.date
                    ? format(
                        entry.date instanceof Date
                          ? entry.date
                          : new Date(entry.date.seconds * 1000),
                        "yyyy-MM-dd"
                      )
                    : today
                }
                className="bg-[#23272F] border border-[#10B981]/30 text-white placeholder-gray-400 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/40 transition"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-[#10B981] font-medium">
                Content
              </Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Write your journal entry here..."
                rows={10}
                required
                defaultValue={entry?.content || ""}
                className="bg-[#23272F] border border-[#10B981]/30 text-white placeholder-gray-400 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/40 resize-none transition"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-white bg-red-600/90 border-l-4 border-red-400 rounded-md shadow">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-white bg-[#10B981]/90 border-l-4 border-[#047857] rounded-md shadow">
                {success}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-2 mt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-[#00ffaa] text-[#00ffaa] hover:bg-[#10B981]/10 focus:ring-2 focus:ring-[#10B981]/40 transition"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#08d692] hover:bg-[#10B981] text-black font-semibold shadow-lg transition focus:ring-2 focus:ring-[#10B981]/40"
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update Entry"
                : "Save Entry"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
