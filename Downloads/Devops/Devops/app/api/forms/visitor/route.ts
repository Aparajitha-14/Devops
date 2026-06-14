import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import VisitorForm from '@/lib/models/VisitorForm';
import { sendVisitorNotification } from '@/lib/utils/whatsapp-notif';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields
    const {
      fullName,
      numberOfVisitors,
      address,
      countryCode,
      phone,
      email,
      howHeardAbout,
      date,
      signature,
      consent,
    } = body;

    if (!fullName || !numberOfVisitors || !address || !countryCode || !phone || !email || !howHeardAbout || !date || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new visitor form document
    const visitorForm = new VisitorForm({
      fullName,
      numberOfVisitors: parseInt(numberOfVisitors),
      address,
      countryCode,
      phone,
      email,
      howHeardAbout,
      date,
      guide: body.guide || '',
      signature,
      consent: consent !== false,
    });

    await visitorForm.save();

    // Send WhatsApp notification (non-blocking)
    try {
      await sendVisitorNotification(
        phone,
        countryCode,
        fullName,
        date
      );
    } catch (notifyError) {
      console.error('Failed to send WhatsApp notification:', notifyError);
      // Don't fail the submission if notification fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Visitor form submitted successfully',
        data: visitorForm,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting visitor form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit visitor form' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();

    const forms = await (VisitorForm as any).find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        message: 'Visitor forms retrieved successfully',
        data: forms,
        count: forms.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching visitor forms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch visitor forms' },
      { status: 500 }
    );
  }
}
