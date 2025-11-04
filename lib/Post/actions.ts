"use server";

import { revalidateTag } from "next/cache";
import { getDatabase } from "@/lib/mongodb";
import { PostSubmissionSchema, SubmitPostResult, VoteResult } from "@/lib/Post/schemas";
import { ObjectId } from "mongodb";
import { auth0 } from "../auth-client";

export async function submitPost(formData: FormData): Promise<SubmitPostResult> {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const url = formData.get("url") as string;

    const validatedData = PostSubmissionSchema.parse({ title, url });

    const db = await getDatabase();
    const postsCollection = db.collection("posts");

    // Check if URL already exists
    const existingPost = await postsCollection.findOne({ url: validatedData.url });
    if (existingPost) {
      throw new Error("This URL has already been submitted");
    }

    const newPost = {
      title: validatedData.title,
      url: validatedData.url,
      points: 1,
      submittedById: session.user.id,
      submittedByName: session.user.name,
      submittedAt: new Date(),
      votes: [session.user.id]
    };

    await postsCollection.insertOne(newPost);
    
    // Revalidate the posts cache
    revalidateTag("posts");
    
    return { success: true };
  } catch (error) {
    console.error("Error submitting post:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to submit post");
  }
}

export async function voteOnPost(postId: string): Promise<VoteResult> {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const db = await getDatabase();
    const postsCollection = db.collection("posts");

    const post = await postsCollection.findOne({ 
      _id: new ObjectId(postId) 
    });

    if (!post) {
      throw new Error("Post not found");
    }

    const userId = session.user.id;
    const votes = (post.votes as string[]) || [];
    const hasVoted = votes.includes(userId);

    let newPoints = (post.points as number) || 0;
    let newVotes: string[];

    if (hasVoted) {
      // Remove vote
      newVotes = votes.filter((id) => id !== userId);
      newPoints = Math.max(0, newPoints - 1);
    } else {
      // Add vote
      newVotes = [...votes, userId];
      newPoints = newPoints + 1;
    }

    await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      { 
        $set: { 
          points: newPoints,
          votes: newVotes 
        } 
      }
    );

    // Revalidate the posts cache
    revalidateTag("posts");

    return { 
      points: newPoints,
      hasVoted: !hasVoted
    };

  } catch (error) {
    console.error("Error voting on post:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to vote on post");
  }
}