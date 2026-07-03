const nodemailer = require('nodemailer');

// Create transporter
let transporter;

try {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 2525;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
    console.log('Nodemailer SMTP Transporter configured.');
  } else {
    console.log('SMTP credentials not configured. Nodemailer running in Mock/Console log mode.');
  }
} catch (err) {
  console.error('Nodemailer configuration error:', err.message);
}

// Send Status Change Email to Resident
const sendComplaintStatusEmail = async (residentEmail, residentName, complaintId, category, newStatus, note) => {
  const subject = `Complaint Status Update - ${category}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Status Update for Your Complaint</h2>
      <p>Hello <strong>${residentName}</strong>,</p>
      <p>The status of your complaint has been updated.</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4f46e5;">
        <p style="margin: 5px 0;"><strong>Complaint ID:</strong> ${complaintId}</p>
        <p style="margin: 5px 0;"><strong>Category:</strong> ${category}</p>
        <p style="margin: 5px 0;"><strong>New Status:</strong> <span style="background-color: #e0e7ff; color: #4338ca; padding: 3px 8px; border-radius: 12px; font-size: 0.9em; font-weight: bold;">${newStatus}</span></p>
        ${note ? `<p style="margin: 5px 0;"><strong>Admin Note:</strong> ${note}</p>` : ''}
      </div>
      <p>You can track the full progress and status history in your dashboard.</p>
      <p style="color: #64748b; font-size: 0.85em; margin-top: 30px;">This is an automated system notification from Society Maintenance Tracker.</p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL || '"Society Maintenance" <noreply@societytracker.com>',
        to: residentEmail,
        subject,
        html: htmlContent
      });
      console.log(`Email sent successfully to ${residentEmail} for complaint status update.`);
    } catch (error) {
      console.error(`Failed to send status update email to ${residentEmail}:`, error.message);
    }
  } else {
    console.log(`[MOCK EMAIL] Sent Status Update to ${residentEmail}:`);
    console.log(`Subject: ${subject}`);
    console.log(`Body Note: ${note || 'None'}`);
  }
};

// Send Important Notice Email to Residents
const sendImportantNoticeEmail = async (residentEmails, noticeTitle, noticeDescription) => {
  const subject = `🚨 Important Notice: ${noticeTitle}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fecaca; border-radius: 8px;">
      <h2 style="color: #dc2626; border-bottom: 2px solid #fee2e2; padding-bottom: 10px;">Important Notice Posted</h2>
      <p>Dear Resident,</p>
      <p>An important notice has been posted on the Society Notice Board by the administration.</p>
      <div style="background-color: #fff5f5; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <h3 style="margin-top: 0; color: #991b1b;">${noticeTitle}</h3>
        <p style="white-space: pre-wrap; color: #374151;">${noticeDescription}</p>
      </div>
      <p>Please check the Notice Board in your portal for further updates.</p>
      <p style="color: #64748b; font-size: 0.85em; margin-top: 30px;">This is an automated system notification from Society Maintenance Tracker.</p>
    </div>
  `;

  if (transporter && residentEmails.length > 0) {
    try {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL || '"Society Maintenance" <noreply@societytracker.com>',
        to: residentEmails.join(', '),
        subject,
        html: htmlContent
      });
      console.log(`Important notice emails sent successfully to ${residentEmails.length} residents.`);
    } catch (error) {
      console.error(`Failed to send important notice email:`, error.message);
    }
  } else {
    console.log(`[MOCK EMAIL] Sent Important Notice to ${residentEmails.join(', ')}:`);
    console.log(`Title: ${noticeTitle}`);
    console.log(`Description: ${noticeDescription}`);
  }
};

module.exports = {
  sendComplaintStatusEmail,
  sendImportantNoticeEmail
};
