import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

// Send notification when new application is received
export const notifyNewApplication = async (applicationId) => {
  try {
    const application = await Application.findById(applicationId)
      .populate("job", "title companyName createdBy")
      .populate("candidate", "name email");

    if (!application || !application.job) {
      return;
    }

    // Get job creator (company)
    const jobCreator = await User.findById(application.job.createdBy);
    if (!jobCreator || !jobCreator.email) {
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const jobUrl = `${frontendUrl}/${application.job.slug}`;
    const applicationsUrl = `${frontendUrl}/admin/applications`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0074b7;">New Application Received</h2>
        <p>You have received a new application for your job posting.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;"><a href="${jobUrl}" style="color: #0074b7; text-decoration: none;">${application.job.title}</a></h3>
          <p><strong>Company:</strong> ${application.job.companyName}</p>
          <p><strong>Applicant:</strong> ${application.candidate?.name || "Anonymous"}</p>
          <p><strong>Email:</strong> ${application.candidate?.email || "Not provided"}</p>
          ${application.coverLetter ? `<p><strong>Cover Letter:</strong><br>${application.coverLetter.substring(0, 200)}${application.coverLetter.length > 200 ? "..." : ""}</p>` : ""}
        </div>
        <p>
          <a href="${applicationsUrl}" style="background-color: #0074b7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View All Applications</a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          You're receiving this because you posted this job. 
          <a href="${frontendUrl}/account">Manage your notification preferences</a>
        </p>
      </div>
    `;

    await sendEmail({
      email: jobCreator.email,
      subject: `New Application: ${application.job.title}`,
      html: emailHtml,
    });

    console.log(`✅ Application notification sent to ${jobCreator.email}`);
  } catch (error) {
    console.error("❌ Error sending application notification:", error);
  }
};

// Send notification when application status changes
export const notifyApplicationStatusChange = async (applicationId, newStatus) => {
  try {
    const application = await Application.findById(applicationId)
      .populate("job", "title companyName")
      .populate("candidate", "name email");

    if (!application || !application.candidate || !application.candidate.email) {
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const jobUrl = `${frontendUrl}/${application.job.slug}`;

    const statusMessages = {
      reviewed: "Your application has been reviewed",
      shortlisted: "Congratulations! You've been shortlisted",
      interview: "You've been selected for an interview",
      rejected: "Thank you for your interest, but we've decided to move forward with other candidates",
      accepted: "Congratulations! Your application has been accepted",
    };

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0074b7;">Application Status Update</h2>
        <p>${statusMessages[newStatus] || "Your application status has been updated"}.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;"><a href="${jobUrl}" style="color: #0074b7; text-decoration: none;">${application.job.title}</a></h3>
          <p><strong>Company:</strong> ${application.job.companyName}</p>
          <p><strong>Status:</strong> <span style="text-transform: capitalize; font-weight: bold;">${newStatus}</span></p>
        </div>
        <p>
          <a href="${jobUrl}" style="background-color: #0074b7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Job Details</a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          <a href="${frontendUrl}/account">Manage your notification preferences</a>
        </p>
      </div>
    `;

    await sendEmail({
      email: application.candidate.email,
      subject: `Application Update: ${application.job.title}`,
      html: emailHtml,
    });

    console.log(`✅ Status change notification sent to ${application.candidate.email}`);
  } catch (error) {
    console.error("❌ Error sending status change notification:", error);
  }
};

// Send job expiration reminder
export const notifyJobExpiring = async (jobId, daysUntilExpiry) => {
  try {
    const job = await Job.findById(jobId).populate("createdBy");

    if (!job || !job.createdBy || !job.createdBy.email) {
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const jobUrl = `${frontendUrl}/${job.slug}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Job Posting Expiring Soon</h2>
        <p>Your job posting will expire in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? "s" : ""}.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;"><a href="${jobUrl}" style="color: #0074b7; text-decoration: none;">${job.title}</a></h3>
          <p><strong>Company:</strong> ${job.companyName}</p>
          <p><strong>Views:</strong> ${job.views || 0}</p>
          <p><strong>Applications:</strong> ${job.applicationCount || 0}</p>
        </div>
        <p>
          <a href="${jobUrl}" style="background-color: #0074b7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Renew Job Posting</a>
        </p>
      </div>
    `;

    await sendEmail({
      email: job.createdBy.email,
      subject: `Your job posting expires in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? "s" : ""}`,
      html: emailHtml,
    });

    console.log(`✅ Job expiration reminder sent to ${job.createdBy.email}`);
  } catch (error) {
    console.error("❌ Error sending expiration reminder:", error);
  }
};

