"use client";

import { Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema } from "@/app/schemas/comments";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, usePreloadedQuery, useQuery, Preloaded } from "convex/react";
import { api } from "@/convex/_generated/api";
import z from "zod";
import { toast } from "sonner";
import { useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";

export function CommentSection(props: {preloadedComments: Preloaded<typeof api.comments.getCommentsByPostId>}) {
  const params = useParams<{ postId: Id<"posts"> }>();
  const data = usePreloadedQuery(props.preloadedComments);
  const comments = data ?? [];
  const [isPending, startTransition] = useTransition()
  const createComment = useMutation(api.comments.createComment);
  const form = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      body: "",
      postId: params.postId
    }
  });

  async function onSubmit(data: z.infer<typeof commentSchema>) {
    startTransition(async () => {
      try {
        await createComment(data);
        toast.success("Comment added successfully!");
        form.reset();
      } catch {
        toast.error("Failed to add comment. Please try again.");
      }
    });
  }

  if (data === undefined) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="size-8 mx-auto animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 border-b">
        <MessageSquare className="size-5" />
        <h2 className="text-xl font-bold">{data.length} Comments</h2>
      </CardHeader>

      <CardContent className="space-y-8">
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)();
        }}>
          <Controller
            name="body"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Comment</FieldLabel>
                <Textarea aria-invalid={fieldState.invalid} placeholder="Share your thoughts..." {...field} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
              </>
            ) : (
              <span>Comment</span>
            )}
          </Button>
        </form>

        {data?.length > 0 && <Separator/>}

        <section className="space-y-6">
          {data?.map((comment) => (
            <div key={comment._id} className="flex gap-4">
              <Avatar className="size-10 shrink-0">
                <AvatarImage src={`https://avatar.vercel.sh/${comment.authorName}`} alt={comment.authorName} />
                <AvatarFallback>{comment.authorName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold">{comment.authorName}</p>

                  <p className="text-xs text-muted-foreground">{new Date(comment._creationTime).toLocaleDateString("en-US")}</p>
                </div>

                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{comment.body}</p>
              </div>
            </div>
          ))}
        </section>
      </CardContent>
    </Card>
  );
}

