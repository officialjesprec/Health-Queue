import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            }
        })
    }

    try {
        const { hospitalId, hospitalName, email, adminName } = await req.json()

        // Validate inputs
        if (!hospitalId || !email) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Email template
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .hospital-id-box { background: white; border: 3px dashed #0d9488; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
    .hospital-id { font-size: 18px; font-weight: bold; color: #0d9488; font-family: monospace; word-break: break-all; }
    .instructions { background: #fff7ed; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; background: #0d9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 Welcome to Health Queue!</h1>
      <p>Your hospital has been successfully registered</p>
    </div>
    
    <div class="content">
      <p>Hello ${adminName || 'Admin'},</p>
      
      <p>Congratulations! <strong>${hospitalName || 'Your hospital'}</strong> has been successfully registered on Health Queue.</p>
      
      <div class="hospital-id-box">
        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">📋 YOUR HOSPITAL ID</p>
        <div class="hospital-id">${hospitalId}</div>
      </div>
      
      <div class="instructions">
        <h3 style="margin-top: 0;">⚠️ Important: Save This ID</h3>
        <p>You will need this Hospital ID to:</p>
        <ul>
          <li><strong>Access your hospital admin portal</strong> at /admin/{hospital-id}/login</li>
          <li><strong>Share with staff members</strong> so they can log in to manage queues</li>
          <li><strong>Manage appointments and patients</strong></li>
        </ul>
      </div>
      
      <h3>🚀 Next Steps:</h3>
      <ol>
        <li>Save your Hospital ID in a secure location</li>
        <li>Complete your hospital profile with services and departments</li>
        <li>Share the Hospital ID with your staff members</li>
        <li>Start accepting patient appointments!</li>
      </ol>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://yourapp.com/admin/${hospitalId}/dashboard" class="button">
          Access Your Dashboard →
        </a>
      </div>
      
      <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
      
      <p>Best regards,<br>
      <strong>The Health Queue Team</strong></p>
    </div>
    
    <div class="footer">
      <p>This email was sent to ${email}</p>
      <p>© 2026 Health Queue. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `

        // Plain text version
        const emailText = `
Welcome to Health Queue!

Your hospital has been successfully registered.

YOUR HOSPITAL ID: ${hospitalId}

⚠️ IMPORTANT: Save this ID! You'll need it to:
• Access your hospital admin portal
• Share with staff members for login
• Manage appointments and patients

Next Steps:
1. Save your Hospital ID in a secure location
2. Complete your hospital profile
3. Share the ID with your staff members
4. Start accepting patient appointments!

Access your dashboard: https://yourapp.com/admin/${hospitalId}/dashboard

Best regards,
The Health Queue Team
    `

        // Send email using Resend (or any email service)
        // Replace this with your email service API call
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: 'Health Queue <noreply@healthqueue.ng>',
                to: [email],
                subject: `🏥 Your Hospital ID for ${hospitalName || 'Your Hospital'}`,
                html: emailHtml,
                text: emailText,
            })
        })

        if (!res.ok) {
            const error = await res.text()
            console.error('Email sending failed:', error)
            // Don't fail the registration if email fails
            return new Response(
                JSON.stringify({ success: false, message: 'Email could not be sent, but registration was successful' }),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            )
        }

        const data = await res.json()

        return new Response(
            JSON.stringify({ success: true, emailId: data.id }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        )
    }
})
