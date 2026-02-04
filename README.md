# Travel Itinerary Generator

An AI-powered web application that generates personalized travel itineraries based on user inputs and delivers them via email.

## Features

- ✈️ **Comprehensive Form**: Collects all essential travel details
- 🤖 **AI-Powered**: Uses OpenAI GPT to generate detailed, personalized itineraries
- 📧 **Email Delivery**: Automatically sends formatted itineraries to users
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations
- ✅ **Form Validation**: Real-time validation and error handling

## Required Form Fields

- Destination / Location
- Number of Days
- Budget (USD)
- Mode of Travel (bus, train, flight, car)
- Number of Travelers
- Language Preferences
- Email Address
- Additional Preferences (optional)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API Key ([Get one here](https://platform.openai.com/api-keys))
- Email account with SMTP access (Gmail recommended)

## Installation

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4o-mini
   
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password_here
   
   PORT=3000
   ```

4. **Gmail App Password Setup** (if using Gmail)
   
   - Go to your Google Account settings
   - Enable 2-Step Verification
   - Go to App Passwords: https://myaccount.google.com/apppasswords
   - Generate an app password for "Mail"
   - Use this app password as `SMTP_PASS` in your `.env` file

## Running the Application

1. **Start the server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

2. **Open your browser**
   
   Navigate to `http://localhost:3000`

3. **Fill out the form**
   
   Enter your travel details and submit the form. The itinerary will be generated and sent to your email address.

## Project Structure

```
travel-itinerary-generator/
├── index.html          # Frontend form
├── style.css           # Styling
├── script.js           # Frontend JavaScript
├── server.js           # Express backend server
├── package.json        # Dependencies
├── .env.example        # Environment variables template
└── README.md           # This file
```

## API Endpoints

### POST `/api/generate-itinerary`

Generates a travel itinerary and sends it via email.

**Request Body:**
```json
{
  "destination": "Paris, France",
  "days": 7,
  "budget": 5000,
  "travelMode": "flight",
  "travelers": 2,
  "language": "English",
  "email": "user@example.com",
  "preferences": "Prefer vegetarian restaurants, interested in museums"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Itinerary generated and sent successfully",
  "email": "user@example.com"
}
```

### GET `/api/health`

Health check endpoint.

## Customization

### Change OpenAI Model

Edit `.env` file:
```env
OPENAI_MODEL=gpt-4  # or gpt-3.5-turbo, gpt-4o-mini, etc.
```

### Change SMTP Provider

Update SMTP settings in `.env` for different email providers:

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

**Custom SMTP:**
```env
SMTP_HOST=your_smtp_server.com
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASS=your_password
```

## Troubleshooting

### "Unable to connect to the server"
- Make sure the backend server is running (`npm start`)
- Check that the server is running on port 3000

### "OpenAI API error"
- Verify your `OPENAI_API_KEY` is correct in `.env`
- Check your OpenAI account has sufficient credits
- Ensure the API key has proper permissions

### "Email authentication failed"
- For Gmail: Use an App Password, not your regular password
- Verify SMTP credentials are correct
- Check if 2FA is enabled (required for Gmail App Passwords)

### Email not received
- Check spam/junk folder
- Verify email address is correct
- Check SMTP server logs in console

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **AI**: OpenAI GPT API
- **Email**: Nodemailer
- **Styling**: Modern CSS with gradients and animations

## License

MIT

## Support

For issues or questions, please check the troubleshooting section or review the code comments.
