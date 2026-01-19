import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getAllData() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [recon, billing, bills, orders, refunds, it, locations, users] = await Promise.all([
    supabase.from('daily_recon').select('*, locations(name)').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: false }),
    supabase.from('billing_inquiries').select('*, locations(name)').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: false }),
    supabase.from('bills_payment').select('*, locations(name)').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: false }),
    supabase.from('order_requests').select('*, locations(name)').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: false }),
    supabase.from('refund_requests').select('*, locations(name)').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: false }),
    supabase.from('it_requests').select('*, locations(name)').order('created_at', { ascending: false }).limit(100),
    supabase.from('locations').select('*').eq('is_active', true),
    supabase.from('users').select('id, name, role').eq('is_active', true)
  ]);

  return {
    dailyRecon: recon.data || [],
    billingInquiries: billing.data || [],
    billsPayment: bills.data || [],
    orderRequests: orders.data || [],
    refundRequests: refunds.data || [],
    itRequests: it.data || [],
    locations: locations.data || [],
    users: users.data || []
  };
}

function buildDataSummary(data) {
  const { dailyRecon, billingInquiries, billsPayment, orderRequests, refundRequests, itRequests, locations } = data;

  const reconPending = dailyRecon.filter(r => !r.status || r.status === 'Pending');
  const reconAccounted = dailyRecon.filter(r => r.status === 'Accounted');
  const totalCollected = dailyRecon.reduce((sum, r) => sum + (parseFloat(r.total_collected) || 0), 0);
  const totalDeposited = dailyRecon.reduce((sum, r) => sum + (parseFloat(r.total_deposit) || 0), 0);

  const itForReview = itRequests.filter(r => r.status === 'For Review');
  const itInProgress = itRequests.filter(r => r.status === 'In Progress');
  const itCritical = itRequests.filter(r => r.urgency === 'Critical' && r.status !== 'Resolved');
  const itHigh = itRequests.filter(r => r.urgency === 'High' && r.status !== 'Resolved');

  const billingPending = billingInquiries.filter(r => r.status === 'Pending');
  const billingTotal = billingInquiries.reduce((sum, r) => sum + (parseFloat(r.amount_in_question) || 0), 0);

  const billsUnpaid = billsPayment.filter(r => r.paid !== 'Yes');
  const billsOverdue = billsPayment.filter(r => r.paid !== 'Yes' && r.due_date && new Date(r.due_date) < new Date());
  const billsTotal = billsPayment.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  const refundsPending = refundRequests.filter(r => r.status === 'Pending');
  const refundsTotal = refundRequests.reduce((sum, r) => sum + (parseFloat(r.amount_requested) || 0), 0);

  const ordersTotal = orderRequests.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  let summary = `
DATABASE SNAPSHOT (Last 30 Days)

LOCATIONS: ${locations.map(l => l.name).join(', ')}

DAILY RECON: ${dailyRecon.length} records
  Pending: ${reconPending.length}
  Accounted: ${reconAccounted.length}
  Total Collected: $${totalCollected.toFixed(2)}
  Total Deposited: $${totalDeposited.toFixed(2)}
  Variance: $${(totalCollected - totalDeposited).toFixed(2)}
`;

  if (reconPending.length > 0) {
    summary += `  Pending Entries:\n`;
    reconPending.slice(0, 5).forEach(r => {
      summary += `    - ${r.recon_date} | ${r.locations?.name} | $${parseFloat(r.total_collected || 0).toFixed(2)}\n`;
    });
  }

  summary += `
IT REQUESTS: ${itRequests.length} total
  For Review: ${itForReview.length}
  In Progress: ${itInProgress.length}
  Critical/High Open: ${itCritical.length + itHigh.length}
`;

  if (itForReview.length > 0 || itInProgress.length > 0) {
    summary += `  Open Tickets:\n`;
    [...itForReview, ...itInProgress].slice(0, 8).forEach(r => {
      summary += `    - IT-${r.ticket_number} | ${r.urgency || 'Low'} | ${r.status} | ${r.locations?.name} | ${r.requester_name}: ${(r.description_of_issue || '').substring(0, 40)}...\n`;
    });
  }

  summary += `
BILLING INQUIRIES: ${billingInquiries.length} total
  Pending: ${billingPending.length}
  Total Amount in Question: $${billingTotal.toFixed(2)}
`;

  if (billingPending.length > 0) {
    summary += `  Pending Cases:\n`;
    billingPending.slice(0, 5).forEach(r => {
      summary += `    - ${r.patient_name} | ${r.inquiry_type || 'General'} | $${parseFloat(r.amount_in_question || 0).toFixed(2)} | ${r.locations?.name}\n`;
    });
  }

  summary += `
BILLS PAYMENT: ${billsPayment.length} total
  Unpaid: ${billsUnpaid.length}
  Overdue: ${billsOverdue.length}
  Total: $${billsTotal.toFixed(2)}
`;

  if (billsOverdue.length > 0) {
    summary += `  Overdue Bills:\n`;
    billsOverdue.slice(0, 5).forEach(r => {
      summary += `    - ${r.vendor} | $${parseFloat(r.amount || 0).toFixed(2)} | Due: ${r.due_date} | ${r.locations?.name}\n`;
    });
  }

  summary += `
ORDER REQUESTS: ${orderRequests.length} total
  Total Amount: $${ordersTotal.toFixed(2)}

REFUND REQUESTS: ${refundRequests.length} total
  Pending: ${refundsPending.length}
  Total Requested: $${refundsTotal.toFixed(2)}
`;

  if (refundsPending.length > 0) {
    summary += `  Pending Refunds:\n`;
    refundsPending.slice(0, 5).forEach(r => {
      summary += `    - ${r.patient_name} | ${r.type || 'Refund'} | $${parseFloat(r.amount_requested || 0).toFixed(2)} | ${r.locations?.name}\n`;
    });
  }

  return summary;
}

export async function POST(request) {
  const { messages, userContext } = await request.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      content: [{ type: 'text', text: 'AI not configured. Add ANTHROPIC_API_KEY to environment variables.' }]
    });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({
      content: [{ type: 'text', text: 'Database access not configured. Add SUPABASE_SERVICE_ROLE_KEY to environment variables.' }]
    });
  }

  try {
    const data = await getAllData();
    const dataSummary = buildDataSummary(data);

    const systemPrompt = `You are the CMS Assistant for KidShine Hawaii dental clinics. You have real-time database access.

IMPORTANT FORMATTING RULES:
- DO NOT use markdown formatting like **bold** or ## headers
- DO NOT use asterisks for emphasis
- Use plain text only
- Use simple dashes (-) for bullet points
- Keep responses concise and clean
- Use line breaks for readability
- Format currency as $X,XXX.XX

YOUR KNOWLEDGE:

Locations: Pearl City, OS, Ortho, Lihue, Kapolei, Kailua, Honolulu, HHDS

User Roles:
- Staff: Enter/edit own records, locked after Friday 11:59 PM Hawaii time
- Finance Admin: View all locations, review/approve records
- Super Admin: Full system access
- IT: Full access to IT requests

Modules:
1. Daily Recon - Cash reconciliation (Pending → Accounted/Rejected)
2. Billing Inquiry - Patient billing questions (Pending → In Progress → Resolved)
3. Bills Payment - Vendor bills (Pending → Approved → Paid)
4. Order Requests - Purchase orders
5. Refund Requests - Patient refunds (Pending → Approved → Completed/Denied)
6. IT Requests - Support tickets with auto-numbers (For Review → In Progress → On-hold → Resolved)

CURRENT USER:
${userContext ? `Name: ${userContext.userName || 'Unknown'}
Role: ${userContext.userRole || 'Unknown'}
Location: ${userContext.currentLocation || 'All'}
Module: ${userContext.currentModule || 'Dashboard'}` : 'Not logged in'}

LIVE DATA:
${dataSummary}

RESPONSE STYLE:
- Be helpful and professional
- Give specific numbers from the data above
- If data exists, show it clearly
- If no data matches the question, say so directly
- Keep answers focused and actionable
- For lists, limit to 5-8 items max

Today: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Pacific/Honolulu' })}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      console.error('Anthropic API error:', await response.text());
      return NextResponse.json({
        content: [{ type: 'text', text: 'AI service error. Please try again.' }]
      });
    }

    return NextResponse.json(await response.json());

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      content: [{ type: 'text', text: 'Connection error. Please try again.' }]
    });
  }
}
