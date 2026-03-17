import { NextResponse } from "next/server"

export async function POST() {
  console.log("hello from server")

  return NextResponse.json({success:true})
}