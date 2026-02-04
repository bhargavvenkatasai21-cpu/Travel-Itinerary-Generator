const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verify SMTP connection
transporter.verify(function (error, success) {
    if (error) {
        console.log('SMTP connection error:', error);
    } else {
        console.log('SMTP server is ready to send emails');
    }
});

// Route to generate itinerary
app.post('/api/generate-itinerary', async (req, res) => {
    try {
        const {
            startingLocation,
            destination,
            days,
            budget,
            travelMode,
            travelers,
            language,
            email,
            preferences
        } = req.body;

        // Validate required fields
        if (!startingLocation || !destination || !days || !budget || !travelMode || !travelers || !language || !email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        // Generate itinerary using OpenAI
        const itineraryPrompt = `Create a detailed ${days}-day travel itinerary from ${startingLocation} to ${destination}.

Requirements:
- Starting location: ${startingLocation}
- Destination: ${destination}
- Duration: ${days} days
- Budget: $${budget} USD (total for ${travelers} traveler${travelers > 1 ? 's' : ''})
- Mode of travel: ${travelMode}
- Number of travelers: ${travelers}
- Language preference: ${language}
${preferences ? `- Additional preferences: ${preferences}` : ''}

Please provide a comprehensive itinerary that includes:
1. Day-by-day breakdown with specific activities
2. Recommended accommodations (with budget considerations)
3. Restaurant suggestions (with cuisine types and price ranges)
4. Transportation details between locations
5. Must-see attractions and landmarks
6. Cultural tips and local customs
7. Budget breakdown per day
8. Packing suggestions
9. Emergency contacts and important information

Format the itinerary in a clear, organized structure that's easy to read via email. Make it practical, realistic, and tailored to the budget and preferences provided.`;

        console.log('Generating itinerary with OpenAI...');
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional travel planner with extensive knowledge of destinations worldwide. Create detailed, practical, and budget-conscious travel itineraries.'
                },
                {
                    role: 'user',
                    content: itineraryPrompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        const itinerary = completion.choices[0].message.content;

        // Send email with itinerary
        const mailOptions = {
            from: `"Travel Itinerary Generator" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Your ${days}-Day Travel Itinerary for ${destination}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .itinerary { background: white; padding: 25px; margin: 20px 0; border-radius: 8px; white-space: pre-wrap; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
                        h1 { margin: 0; }
                        h2 { color: #667eea; margin-top: 25px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✈️ Your Travel Itinerary</h1>
                            <p>${startingLocation} → ${destination} • ${days} Days • $${budget} Budget</p>
                        </div>
                        <div class="content">
                            <p>Hello!</p>
                            <p>Thank you for using our Travel Itinerary Generator. We've created a personalized ${days}-day itinerary for your trip from <strong>${startingLocation}</strong> to <strong>${destination}</strong>.</p>
                            
                            <div class="itinerary">
${itinerary}
                            </div>
                            
                            <p>We hope you have an amazing trip! Safe travels! 🌍</p>
                            
                            <div class="footer">
                                <p>This itinerary was generated by Travel Itinerary Generator</p>
                                <p>For any questions or modifications, please contact us.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
Your ${days}-Day Travel Itinerary from ${startingLocation} to ${destination}

${itinerary}

---
This itinerary was generated by Travel Itinerary Generator
            `
        };

        console.log('Sending email...');
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', email);

        res.json({
            success: true,
            message: 'Itinerary generated and sent successfully',
            email: email
        });

    } catch (error) {
        console.error('Error generating itinerary:', error);
        
        // Provide more specific error messages
        if (error.response) {
            return res.status(500).json({
                error: 'OpenAI API error: ' + error.response.data?.error?.message || 'Failed to generate itinerary'
            });
        } else if (error.code === 'EAUTH') {
            return res.status(500).json({
                error: 'Email authentication failed. Please check your SMTP credentials.'
            });
        } else {
            return res.status(500).json({
                error: 'An error occurred while generating your itinerary. Please try again.'
            });
        }
    }
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Travel Itinerary Generator API is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📧 Make sure to configure SMTP settings in .env file`);
    console.log(`🤖 Make sure to set OPENAI_API_KEY in .env file`);
});
