# 2Way SMS - Two-Way SMS Communication Platform

A robust, scalable two-way SMS web application inspired by Google Voice, built with Next.js, Supabase, and Twilio.

## 🚀 Features

### User Features
- **Two-Way SMS Communication**: Send and receive SMS messages with real-time delivery tracking
- **Multiple Phone Numbers**: Manage multiple assigned phone numbers from a single dashboard
- **Conversation Threading**: Google Voice-inspired interface with organized conversation threads
- **Bulk SMS**: Send personalized messages to multiple recipients simultaneously
- **Voice Calls**: Make and receive voice calls directly from the browser
- **Credits System**: SMS and voice credits management

### Admin Features
- **User Management**: Complete control over user accounts and permissions
- **Phone Number Assignment**: Dynamically assign/revoke phone numbers to users
- **Credit Allocation**: Manage SMS and voice credits per user
- **Analytics & Reporting**: Monitor usage and generate detailed reports
- **Real-time Dashboard**: Track all platform activity in real-time

## 🛠 Technology Stack

- **Frontend**: React.js, Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS, ShadCN UI, Framer Motion
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **SMS/Voice**: Twilio API
- **Real-time**: Supabase Realtime

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Twilio account
- PostgreSQL database (via Supabase)

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/2way-sms.git
cd 2way-sms
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
```

4. Set up the database:
Run the SQL schema in `src/lib/db/schema.sql` in your Supabase SQL editor.

5. Start the development server:
```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin dashboard and pages
│   ├── dashboard/         # User dashboard
│   ├── conversations/     # Messaging interface
│   └── api/              # API routes
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── user/             # User-specific components
│   └── shared/           # Shared components
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase client configuration
│   ├── twilio/           # Twilio integration
│   ├── auth/             # Authentication utilities
│   └── db/               # Database schema
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
└── utils/                 # Utility functions
```

## 🔐 Authentication & Authorization

The application uses Supabase Auth for authentication with role-based access control:
- **Users**: Can access messaging features and manage their conversations
- **Admins**: Full platform control including user management and system configuration

## 📱 API Integration

### Twilio Integration
- SMS sending/receiving via Twilio API
- Phone number provisioning
- Voice call functionality
- Webhook endpoints for incoming messages/calls

### Supabase Integration
- Real-time database updates
- Row-level security policies
- Authentication and user management

## 🚦 Getting Started

1. **Sign Up**: Create an account with email and password
2. **Admin Setup**: First user should be manually promoted to admin in Supabase
3. **Phone Numbers**: Admin assigns phone numbers to users
4. **Credits**: Admin allocates SMS/voice credits to users
5. **Start Messaging**: Users can start conversations and send messages

## 🔄 Development Workflow

1. **Database Changes**: Update schema in `src/lib/db/schema.sql`
2. **Type Safety**: Update TypeScript types in `src/types/`
3. **API Routes**: Add new endpoints in `src/app/api/`
4. **Components**: Create reusable components in `src/components/`
5. **Testing**: Test features thoroughly before deployment

## 📈 Deployment

The application is optimized for deployment on Vercel:

1. Push to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@2waysms.com or open an issue in the GitHub repository.

---

Built with ❤️ using Next.js, Supabase, and Twilio
