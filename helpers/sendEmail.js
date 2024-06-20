import sgMail from "@sendgrid/mail";
import "dotenv/config";

const { SENDGRID_API_KEY, UKR_NET_FROM } = process.env;

if (!SENDGRID_API_KEY || !UKR_NET_FROM) {
  throw new Error("SendGrid API key or sender email is missing.");
}

sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  const msg = {
    to,
    from: UKR_NET_FROM,
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent");
  } catch (error) {
    console.error("Error sending email:", error.response.body.errors);
    throw new Error("Failed to send email");
  }
};

export default sendEmail;
