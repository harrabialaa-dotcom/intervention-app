import nodemailer from 'nodemailer';
import PdfTable from 'pdfkit-table';

let transporter: nodemailer.Transporter | null = null;

export async function getMailTransporter() {
  if (transporter) return transporter;

transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

  return transporter;
}

export async function sendApprovalEmail(to: string, roleLabel: string, code: string, requestDetails: any) {
  const mailer = await getMailTransporter();
  const appUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const requestUrl = `${appUrl}/request/${requestDetails.id}`;
  
  const info = await mailer.sendMail({
    from: '"Valeo Tracking Involvement" <harrabialaa@gmail.com>',
    to: to,
    subject: `Action Required: Intervention Approval - ${requestDetails.subcontractor}`,
    text: `Hello,\n\nA new intervention request requires your approval (${roleLabel}).\n\nTo validate this request, please enter the following secret PIN:\n\nSECRET PIN: ${code}\n\nOpen the request here: ${requestUrl}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #6cc04a; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-weight: 600;">Action Required: Approval</h2>
        </div>
        
        <div style="padding: 25px; background-color: #ffffff; color: #1e293b;">
          <p style="font-size: 16px;">Hello,</p>
          <p style="font-size: 16px;">A new intervention request requires your <strong>${roleLabel}</strong>.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-left: 4px solid #6cc04a; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <strong style="color: #0f172a; display: block; margin-bottom: 10px;">Intervention Details:</strong>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
              <li><strong>Subcontractor:</strong> ${requestDetails.subcontractor}</li>
              <li><strong>Section:</strong> ${requestDetails.section}</li>
              <li><strong>Date:</strong> ${requestDetails.date}</li>
              <li><strong>Reason:</strong> ${requestDetails.reason}</li>
            </ul>
          </div>

          <p style="font-size: 16px;">To validate this request, please open the application and enter the following secret PIN in your validation zone:</p>
          
          <div style="text-align: center; margin: 35px 0;">
            <span style="background: #f1f5f9; color: #6cc04a; padding: 15px 35px; font-size: 32px; font-weight: bold; border-radius: 8px; letter-spacing: 6px; border: 2px dashed #cbd5e1; display: inline-block;">
              ${code}
            </span>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${requestUrl}" style="display: inline-block; text-decoration: none; background: #6cc04a; color: #ffffff; padding: 14px 26px; border-radius: 10px; font-weight: 700;">Open this intervention and enter the code</a>
          </div>
          
          <p style="font-size: 14px; color: #64748b; margin-top: 10px;">This link opens the specific intervention only.</p>
          <p style="font-size: 14px; color: #64748b; margin-top: 30px;">Best regards,<br/>Valeo IT Team.</p>
        </div>
      </div>
    `
  });

  console.log(`\n📧 [EMAIL SENT TO ${to}] -> Message ID: ${info.messageId}`);
  return info;
}

export async function sendFinalPDFEmail(to: string, requestDetails: any) {
  const mailer = await getMailTransporter();
  
  let logoBuffer: Buffer | null = null;
  try {
    const fs = await import('fs');
    const path = await import('path');
    const logoPath = path.join(process.cwd(), 'public', 'logo2.png');
    logoBuffer = await fs.promises.readFile(logoPath);
  } catch(e) {
    console.error('Failed to load local Valeo logo', e);
  }

  // Generate PDF in memory using pdfkit-table
  const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
    const doc = new PdfTable({ margin: 30, size: 'A4', layout: 'landscape' });
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    (async () => {
      try {
        const requesterText = `Requester: ${requestDetails.demandeurEmail}`;
        doc.font("Helvetica-Bold").fontSize(12).fillColor('#0f172a')
           .text(requesterText, 30, 30, { align: 'left' });

        if (logoBuffer) {
          doc.image(logoBuffer, 30, 55, { width: 100 });
        }
        
        doc.font("Helvetica-Bold").fontSize(14).fillColor('#000000')
           .text('Special Authorization N°........', 0, 90, { align: 'center' });
        
        doc.moveDown(4);

        const infoTable = {
          headers: [
            { label: "Subcontractor/External Body", property: 'sub', width: 140 },
            { label: "Section/Service", property: 'sec', width: 100 },
            { label: "Date", property: 'date', width: 70 },
            { label: "Time", property: 'time', width: 70 },
            { label: "Accompanying", property: 'acc', width: 120 },
            { label: "Reason for Intervention", property: 'reason', width: 140 },
            { label: "Comments", property: 'comments', width: 140 }
          ],
          datas: [
            {
              sub: requestDetails.subcontractor,
              sec: requestDetails.section,
              date: requestDetails.date,
              time: requestDetails.time,
              acc: requestDetails.accompanying || '',
              reason: requestDetails.reason,
              comments: ''
            }
          ]
        };

        await doc.table(infoTable, {
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
          prepareRow: () => doc.font("Helvetica").fontSize(9),
          padding: 10,
        });

        doc.moveDown(2);

        const dateStr = (app: any) => app?.approvedAt ? new Date(app.approvedAt).toLocaleDateString() : 'Pending';

        const sigTable = {
          headers: [
            { label: "Requester", property: 'req', width: 156 },
            { label: "N+1 Manager", property: 'n1', width: 156 },
            { label: "HSE Dept", property: 'hse', width: 156 },
            { label: "HR Dept", property: 'hr', width: 156 },
            { label: "Plant Director", property: 'dir', width: 156 }
          ],
          datas: [
            {
              req: `${requestDetails.demandeurEmail}\nAuto-Approved`,
              n1: `${requestDetails.n1Email}\nApproved\n${dateStr(requestDetails.approvals.N1)}`,
              hse: `khalifa.lassoued@valeo.com\nApproved\n${dateStr(requestDetails.approvals.HSE)}`,
              hr: `sonia.rouatbi@valeo.com\nApproved\n${dateStr(requestDetails.approvals.RH)}`,
              dir: `bilel.belhaj-amor@valeo.com\nApproved\n${dateStr(requestDetails.approvals.Direction)}`
            }
          ]
        };

        await doc.table(sigTable, {
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
          prepareRow: () => doc.font("Helvetica").fontSize(9),
          padding: 15,
        });

        doc.end();
      } catch (err) {
        reject(err);
      }
    })();
  });

  const info = await mailer.sendMail({
    from: '"Valeo Tracking Involvement" <harrabialaa@gmail.com>',
    to: to,
    subject: `Intervention Approved - ${requestDetails.subcontractor}`,
    text: `Hello,\n\nThe intervention has been validated by all stakeholders.\n\nPlease find attached the official intervention authorization PDF.\n\nBest regards,\nValeo IT Team.`,
    attachments: [
      {
        filename: `Authorization_${requestDetails.subcontractor.replace(/\s+/g, '_')}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  });

  console.log(`\n📧 [FINAL PDF SENT TO ${to}] -> Message ID: ${info.messageId}`);
  return info;
}
