import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CommentSection } from "@/components/web/CommentSection";
import { PostPresence } from "@/components/web/PostPresence";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server-old";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";



interface PostIdRouteProps {
  params: Promise<{
    postId: Id<"posts">;
  }>;
}

export async function generateMetadata({ params }: PostIdRouteProps): Promise<Metadata> {
  const { postId } = await params;
  const post = await fetchQuery(api.posts.getPostById, { postId });

  if (!post) {
    return {
      title: "Post Not Found | Nextjs16 + Convex Starter",
      description: "The post you are looking for does not exist.",
      category: "Blog",
    }
  }

  return {
    title: `${post.title} | Nextjs16 + Convex Starter`,
    description: post.body.substring(0, 160),
    category: "Blog",
  };
}

export default async function PostIdRoute({ params }: PostIdRouteProps) {
  const { postId } = await params;

  const token = await getToken()

  const [post, preloadedComments, userId] = await Promise.all([
    await fetchQuery(api.posts.getPostById, { postId }),
    await preloadQuery(api.comments.getCommentsByPostId, { postId }),
    await fetchQuery(api.presence.getUserId, {}, { token }),
  ]);

  if(!userId) {
    return redirect("/auth/login") 
 }


  if (!post) {
    return <div className="py-12 text-center">Post not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-500 relative">

      <Link href="/blog" className={buttonVariants({ variant: "outline", className: "mb-4" })}>
        <ArrowLeft className="size-4" /> Back to Blog
      </Link>

      <div className="relative w-full h-[400] mb-8 rounded-xl overflow-hidden shadow-sm">
        <Image src={post.imageUrl ?? "https://plus.unsplash.com/premium_photo-1683910767532-3a25b821f7ae?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZnJlZSUyMGltYWdlc3xlbnwwfHwwfHx8MA%3D%3D"} alt={post.title} fill className="object-cover hover:scale-105 transition-transform duration-500" />
      </div>

      <div className="space-y-4 flex flex-col">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">{post.title}</h1>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Posted on: {new Date(post._creationTime).toLocaleDateString("en-US")}</p>
          {userId && <PostPresence roomId={post._id} userId={userId} />}
        </div>

      </div>

      <Separator className="my-8" />
      <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">{post.body}</p>
      <Separator className="my-8" />

      <CommentSection preloadedComments={preloadedComments} />
    </div>
  )
}