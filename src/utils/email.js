const { Resend } = require("resend");

// Initialize Resend client with your API key (from .env file)
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email using Resend.
 *
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content for the email body
 * @returns {object} - JSON-style response { success: boolean, message: string, data?: any }
 */

async function sendEmail(to, subject, htmlContent) {
  try {
    const response = await resend.emails.send({
      from: "DevTinder <onboarding@resend.dev>", // default Resend sender email
      to,
      subject,
      html: htmlContent,
    });

    return {
      success: true,
      message: "Email sent successfully",
      data: response, // optional — can contain Resend response ID, etc.
    };
  } catch (err) {
    console.error("Error sending email:", err);

    return {
      success: false,
      message: "Failed to send email",
      error: err.message || "Unknown error occurred",
    };
  }
}

module.exports = sendEmail;

/*
This file is a utility module that handles all email-sending logic in one place.

You only need to import this function (sendEmail) wherever you want to send an email — for example, when sending OTPs, password reset links, or notifications.

It uses Resend’s official Node.js SDK to send emails securely from your server.

It keeps your API key safe (stored in .env).

If sending fails, it returns a structured error object (not crashes your server).

*/
