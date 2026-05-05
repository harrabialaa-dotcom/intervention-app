import { NextResponse } from "next/server";
import { getRequestById, updateRequest } from "@/lib/db";
import { sendApprovalEmail, sendFinalPDFEmail } from "@/lib/mail";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();
    const { role, code } = body;

    const req = await getRequestById(id);
    if (!req) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const approvalRecord = req.approvals[role as keyof typeof req.approvals];
    if (!approvalRecord) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    if (approvalRecord.secretCode !== code) return NextResponse.json({ error: "Code incorrect" }, { status: 403 });

    approvalRecord.status = "Approved";
    approvalRecord.approvedAt = new Date().toISOString();

    if (role === "N1") {
      try {
        await sendApprovalEmail("khalifa.lassoued@valeo.com", "HSE", req.approvals.HSE.secretCode, req);
        await sendApprovalEmail("sonia.rouatbi@valeo.com", "RH", req.approvals.RH.secretCode, req);
        await sendApprovalEmail("bilel.belhaj-amor@valeo.com", "Direction", req.approvals.Direction.secretCode, req);
      } catch (mailError) {
        console.error("Failed to send secondary emails:", mailError);
      }
    }

    const allApproved = Object.values(req.approvals).every(a => a.status === "Approved");
    if (allApproved) {
      req.status = "Approved";
      try { await sendFinalPDFEmail(req.demandeurEmail, req); } catch (e) { console.error(e); }
    }

    await updateRequest(id, { approvals: req.approvals, status: req.status });
    return NextResponse.json(req);
  } catch (error: any) {
    console.error("APPROVE ERROR:", error.message);
    return NextResponse.json({ error: error.message || "Failed to approve" }, { status: 500 });
  }
}