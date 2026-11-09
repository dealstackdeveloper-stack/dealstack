
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const allowedSubjects = [
  "Product Enquiry",
  "Order Status",
  "Shipping and Delivery",
  "Return or Replacement",
  "Payment Enquiry",
  "Business Enquiry",
  "Other",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (name.length > 100 || email.length > 254 || phone.length > 20 || message.length > 5000) {
      return NextResponse.json(
        { error: "One or more fields exceed the allowed length." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!allowedSubjects.includes(subject)) {
      return NextResponse.json(
        { error: "Invalid enquiry type." },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: "Message must contain at least 10 characters." },
        { status: 400 }
      );
    }

    const { error } = await resend.emails.send({
      from: "Dealstack Website <onboarding@resend.dev>",
      to: ["developer.dealstack@gmail.com"],
      replyTo: email,
      subject: `Dealstack Contact - ${subject}`,
      text: `
New enquiry received from Dealstack website.

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Enquiry type: ${subject}

Message:
${message}
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Email could not be sent. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
