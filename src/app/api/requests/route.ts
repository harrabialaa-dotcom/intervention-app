import { NextResponse } from "next/server";
import { getDb, insertRequest } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { sendApprovalEmail } from "@/lib/mail";

export async function GET() {
  const db = await getDb();
  return NextResponse.json(db.requests);
}

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export async function POST(request) {
  try {
    const body = await request.json();
    const newRequest = {
      id: uuidv4(),
      subcontractor: body.subcontractor,
      section: body.section,
      date: body.date,
      time: body.time,
      accompanying: body.accompanying || "",
      reason: body.reason,
      demandeurEmail: body.demandeurEmail,
      n1Email: body.n1Email,
      status: "Pending",
      createdAt: new Date().toISOString(),
      approvals: {
        HSE: { status: "Pending", approvedAt: null, secretCode: generateCode() },
        RH: { status: "Pending", approvedAt: null, secretCode: generateCode() },
        Direction: { status: "Pending", approvedAt: null, secretCode: generateCode() },
        N1: { status: "Pending", approvedAt: null, secretCode: generateCode() },
      }
    };
    await insertRequest(newRequest);
    try {
      await sendApprovalEmail(newRequest.n1Email, "N+1", newRequest.approvals.N1.secretCode, newRequest);
    } catch (mailError) {
      console.error("Failed to send email:", mailError);
    }
    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("ERROR:", error.message);
    return NextResponse.json({ error: error.message || "Failed to create request" }, { status: 500 });
  }
}
