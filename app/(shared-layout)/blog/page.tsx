
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

// export const dynamic = 'force-static'
// 'auto' | 'force-dynamic' | 'error' | 'force-static'

// export const revalidate = 30
// false | 0 | number

export const metadata: Metadata = {
  title: "Blog | Nextjs16 + Convex Starter",
  description: "Read the latest articles from our community",
  category: "Blog",
  creator: "Your Name or Company",
}


export default function BlogPage() {

  return (
    <div className="py-12">

      <div className="text-center pb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Our Blog</h1>
        <p className="text-xl text-muted-foreground pt-4 max-w-2xl mx-auto">Read the latest articles from our community</p>
      </div>

      <Suspense fallback={<SkeletonLoadingUI />}>
        <LoadBlogList />
      </Suspense>
    </div>
  )
}

async function LoadBlogList() {
  // await connection();
  "use cache";
  cacheLife("hours");
  cacheTag("blog");
  const data = await fetchQuery(api.posts.getPosts);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {data?.map((post) => (
        <Card key={post._id} className="pt-0">
          <div className="h-48 w-full overflow-hidden relative">
            <Image src={post.imageUrl ?? "https://plus.unsplash.com/premium_photo-1683910767532-3a25b821f7ae?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZnJlZSUyMGltYWdlc3xlbnwwfHwwfHx8MA%3D%3D"} alt="image" fill className="rounded-t-lg object-cover" />
          </div>

          <CardContent>
            <Link href={`/blog/${post._id}`} className="text-2xl font-bold mb-2 block hover:underline">
              <h1 className="text-2xl font-bold hover:text-primary">
                {post.title}
              </h1>
            </Link>
            <p className="text-muted-foreground line-clamp-3">{post.body}</p>
          </CardContent>

          <CardFooter>
            <Link href={`/blog/${post._id}`} className={buttonVariants({ className: "w-full" })} >
              Read more
            </Link>
          </CardFooter>

        </Card>
      ))}
    </div>
  )
}

function SkeletonLoadingUI() {
  return (
    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">{
      [...Array(3)].map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>


  );
}