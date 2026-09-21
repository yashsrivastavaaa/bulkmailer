# Bulkmailer

> A controlled Gmail campaign workspace that turns Excel/CSV recipient
> data into personalized, review-first email campaigns.

[![Live
Demo](https://img.shields.io/badge/Live-Demo-111827?style=flat-square)](https://bulkmailer-three.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

## Live Demo

**Production:** https://bulkmailer-three.vercel.app/

Bulkmailer is designed around a simple principle:

> **Make bulk email feel deliberate instead of dangerous.**

Instead of blindly sending to a large list, the application provides a
controlled workflow for importing recipients, mapping spreadsheet
fields, personalizing messages, verifying addresses, reviewing the final
audience, and sending through the user's connected Gmail account.

------------------------------------------------------------------------

## What It Does

Bulkmailer provides an end-to-end campaign workflow for operational and
personalized email:

1.  **Load recipient data** from Excel/CSV files or pasted email
    addresses.
2.  **Clean and inspect the audience** with duplicate removal,
    validation, search, filtering, and selection controls.
3.  **Map spreadsheet columns** to email/name fields while keeping other
    columns available for personalization.
4.  **Compose personalized email content** using dynamic variables such
    as `{{name}}`, `{{email}}`, and imported custom fields.
5.  **Preview the message** before sending.
6.  **Verify recipient emails** and surface addresses that need
    attention.
7.  **Run final pre-flight checks** before a campaign is launched.
8.  **Send through Gmail API** using the connected Google account.
9.  **Track campaign delivery** with sent/failed/pending recipient
    states.
10. **Review campaign history and analytics** after sending.
11. **Retry failed recipients** or duplicate existing campaigns when
    needed.
12. **Manage reusable templates, recipient lists, contacts, plans, and
    account settings.**

------------------------------------------------------------------------

## Core Features

### Spreadsheet-native recipient management

-   Excel (`.xlsx`) and CSV support
-   Paste multiple addresses separated by:
    -   commas
    -   spaces
    -   semicolons
    -   new lines
-   Automatic duplicate removal
-   Invalid-email filtering
-   Search recipients
-   Filter by verification state
-   Select/unselect individual recipients
-   Select all filtered recipients
-   Save reusable recipient lists
-   Support for custom spreadsheet columns

### Personalization

Imported spreadsheet columns remain available as campaign data.

Examples:

``` text
{{name}}
{{email}}
{{company}}
{{invoice_number}}
{{due_date}}
{{application_status}}
```

This makes the same campaign workflow useful for:

-   recruiting outreach
-   invoice and billing follow-ups
-   customer communication
-   account operations
-   sales outreach
-   application updates
-   internal notifications
-   other data-driven operational email

### Gmail integration

Bulkmailer uses Google OAuth to connect a user's Gmail account and sends
messages through the Gmail API.

The application:

-   keeps Google OAuth credentials server-side
-   uses refresh-token based Gmail authorization
-   sends from the connected Gmail account
-   supports HTML email
-   supports attachments
-   provides a dedicated test-send flow
-   protects campaign sending behind authenticated sessions

### Review-first sending

Sending is intentionally not a single blind action.

The workflow includes:

``` text
Import
  ↓
Select recipients
  ↓
Map fields
  ↓
Compose
  ↓
Preview
  ↓
Verify
  ↓
Final review
  ↓
Send through Gmail
```

The campaign API also checks the active plan's recipient and
monthly-send limits before creating a campaign.

### Campaign management

Campaigns can be:

-   created
-   viewed
-   duplicated
-   retried for failed recipients
-   inspected at recipient level
-   tracked by status
-   analyzed after completion

Campaign records keep information such as:

-   subject
-   source list
-   attachment
-   total recipients
-   sent count
-   failed count
-   campaign status
-   creation/completion timestamps
-   health score
-   health issues

### Analytics

The analytics workspace provides campaign-level reporting and date-based
performance views, including:

-   total campaigns
-   total emails sent
-   campaign performance over time
-   top-performing campaigns
-   open/reply metrics where available
-   campaign history
-   delivery information

### Templates

Reusable templates support:

-   template name
-   subject
-   HTML/body content
-   saved template selection
-   campaign personalization

### Contacts

Contacts are maintained independently from individual campaigns and can
include:

-   email
-   name
-   total sent
-   total failed
-   first contacted date
-   last contacted date
-   last subject
-   last status

------------------------------------------------------------------------

## Tech Stack

  Layer                 Technology
  --------------------- -------------------------------
  Framework             Next.js 15
  UI                    React 19
  Language              TypeScript
  Styling               Custom CSS / responsive UI
  Runtime               Node.js
  Database              PostgreSQL
  Database driver       `pg`
  Email provider        Gmail API
  Google integration    `googleapis`
  Spreadsheet parsing   `xlsx`
  Authentication        Google OAuth + secure session
  Deployment            Vercel

------------------------------------------------------------------------

## Architecture

Bulkmailer is implemented as a full-stack Next.js application.

``` text
┌─────────────────────────────────────────────┐
│                 Bulkmailer UI                │
│          Next.js + React + TypeScript        │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│            Next.js Route Handlers            │
│                                             │
│ Auth · Campaigns · Contacts · Templates     │
│ Sending · Verification · Plans · Usage      │
└───────────────┬─────────────────┬───────────┘
                │                 │
                ▼                 ▼
       ┌────────────────┐  ┌─────────────────┐
       │  PostgreSQL    │  │    Gmail API    │
       │                │  │                 │
       │ Users          │  │ OAuth           │
       │ Campaigns      │  │ Send email      │
       │ Recipients     │  │ Attachments     │
       │ Contacts       │  │ Message IDs     │
       │ Templates      │  │                 │
       │ Plans          │  │                 │
       └────────────────┘  └─────────────────┘
```

### Important design choice

The project keeps the email provider and application data behind the
server-side Next.js layer instead of exposing Gmail credentials or
database access to the browser.

------------------------------------------------------------------------

## API Surface

The application exposes route handlers for the main product workflows.

### Authentication

``` text
GET  /api/auth/google
GET  /api/auth/callback
GET  /api/auth/status
POST /api/auth/logout
```

### Campaigns

``` text
GET   /api/campaigns
POST  /api/campaigns
GET   /api/campaigns/:id
PATCH /api/campaigns/:id

POST  /api/campaigns/:id/duplicate
POST  /api/campaigns/:id/retry
```

### Sending

``` text
POST /api/send
POST /api/send/test
```

### Recipients & contacts

``` text
GET  /api/recipient-lists
POST /api/recipient-lists

GET  /api/contacts
GET  /api/contacts/:id
```

### Templates

``` text
GET  /api/templates
POST /api/templates
```

### Verification & usage

``` text
POST /api/verify-emails
GET  /api/usage
GET  /api/account/plan
GET  /api/plans
```

### Admin

``` text
GET   /api/admin
PATCH /api/admin
```

------------------------------------------------------------------------

## Database Model

The PostgreSQL layer includes relational data for the core application
workflows.

Main entities include:

``` text
users
plans
user_subscriptions
google_accounts
campaigns
campaign_recipients
recipient_lists
contacts
feature_definitions
templates
```

The schema also uses indexes for recipient and contact lookups and
stores campaign recipient personalization data as JSON where flexible
spreadsheet columns are required.

------------------------------------------------------------------------

## Security

Security-sensitive operations are intentionally kept server-side.

### OAuth

Google OAuth is used to authorize Gmail access.

The callback flow:

1.  validates the OAuth state
2.  exchanges the authorization code for Google tokens
3.  requires a refresh token
4.  extracts the account email from the ID token
5.  establishes the application session
6.  stores the connected Google account server-side

### Sessions

Authenticated requests use the application's session layer before
accessing protected campaign, contact, template, sending, or usage APIs.

### Sending protections

The send endpoint includes checks such as:

-   authenticated Gmail session
-   request-origin validation
-   recipient email validation
-   required subject/body validation
-   attachment-size validation
-   plan recipient limits
-   monthly sending limits

------------------------------------------------------------------------

## Project Structure

``` text
bulkmailer/
├── app/
│   ├── api/
│   │   ├── account/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── campaigns/
│   │   ├── contacts/
│   │   ├── plans/
│   │   ├── recipient-lists/
│   │   ├── send/
│   │   ├── templates/
│   │   ├── usage/
│   │   └── verify-emails/
│   │
│   ├── analytics/
│   ├── campaigns/
│   ├── contacts/
│   ├── dashboard/
│   ├── help/
│   ├── pricing/
│   ├── privacy/
│   ├── profile/
│   ├── settings/
│   ├── templates/
│   ├── terms/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── AppShell.tsx
│   ├── ConnectCard.tsx
│   ├── LoadingScreen.tsx
│   ├── LoginRequired.tsx
│   ├── PageLoading.tsx
│   ├── SelectMenu.tsx
│   └── ThemeToggle.tsx
│
├── lib/
│   ├── app-user.ts
│   ├── authz.ts
│   ├── client-auth.ts
│   ├── db.ts
│   ├── gmail.ts
│   ├── oauth.ts
│   └── session.ts
│
├── scripts/
│   └── init-db.mjs
│
├── next.config.ts
├── package.json
├── tsconfig.json
└── vercel.json
```

------------------------------------------------------------------------

## Getting Started

### Prerequisites

-   Node.js 18+
-   PostgreSQL database
-   Google Cloud project
-   Google OAuth Web Application credentials

### 1. Clone the repository

``` bash
git clone https://github.com/YOUR_USERNAME/bulkmailer.git
cd bulkmailer
```

### 2. Install dependencies

``` bash
npm install
```

### 3. Configure Google OAuth

Create a Google OAuth client for a **Web application**.

For local development, use:

``` text
http://localhost:3000/api/auth/callback
```

For production, use:

``` text
https://YOUR-DOMAIN/api/auth/callback
```

Add the callback URL to the Google OAuth client's authorized redirect
URIs.

For a development OAuth app, add the required Gmail account as a test
user.

### 4. Configure environment variables

Create `.env.local`:

``` env
DATABASE_URL=your_postgresql_connection_string

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback

APP_ENCRYPTION_KEY=your_32_byte_hex_key

ADMIN_EMAILS=admin@example.com
```

Generate an encryption key with:

``` bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Start the application

``` bash
npm run dev
```

Open:

``` text
http://localhost:3000
```

------------------------------------------------------------------------

## Production Deployment

The application is deployed on Vercel.

Production environment variables should include:

``` env
DATABASE_URL=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://YOUR-DOMAIN/api/auth/callback
APP_ENCRYPTION_KEY=...
ADMIN_EMAILS=...
```

After deployment, make sure the exact production OAuth callback URL is
also registered in Google Cloud.

------------------------------------------------------------------------

## Available Scripts

``` bash
npm run dev
```

Starts the development server.

``` bash
npm run build
```

Creates a production build.

``` bash
npm run start
```

Runs the production build.

``` bash
npm run lint
```

Runs TypeScript type checking.

``` bash
npm run db:init
```

Initializes/migrates the PostgreSQL schema using `.env.local`.

------------------------------------------------------------------------

## Product Workflow

### 01 --- Audience

Users can upload an Excel/CSV file or paste recipients directly.

The interface provides:

-   recipient count
-   search
-   filters
-   selection
-   verification state
-   custom-field visibility

### 02 --- Message

Users compose the campaign and can:

-   select saved templates
-   edit subject/body
-   insert personalization variables
-   map spreadsheet columns
-   preview the final message

### 03 --- Review & Send

Before sending, the application performs a pre-flight review.

Users can verify:

-   selected recipient count
-   recipient health
-   campaign content
-   attachments
-   sending readiness

### 04 --- Activity

During/after sending, the workspace provides campaign activity and
recipient-level status information.

------------------------------------------------------------------------

## Why This Project Is Interesting

Bulkmailer was built around a common problem with traditional bulk-email
tooling:

**Scale often removes control.**

This project takes the opposite approach.

It combines:

-   spreadsheet-native workflows
-   Gmail-native sending
-   data-driven personalization
-   recipient-level control
-   verification
-   explicit pre-flight review
-   campaign analytics
-   reusable templates
-   plan-based limits
-   server-side authentication and authorization

The result is a workflow closer to an operations tool than a generic
marketing blast platform.

------------------------------------------------------------------------

## Future Improvements

Potential next steps for a larger production deployment:

-   background job queue for long-running campaigns
-   scheduled campaign workers
-   distributed rate limiting
-   durable session/token architecture
-   stronger CSRF/session hardening
-   email event webhooks
-   open/click tracking
-   richer deliverability analytics
-   attachment object storage
-   audit logs
-   automated bounce processing
-   team/workspace support
-   production-grade observability

------------------------------------------------------------------------

## License

This project is currently maintained as a private portfolio/product
project.

------------------------------------------------------------------------

## Author

**Yash Srivastava**

Built with Next.js, TypeScript, PostgreSQL, Google OAuth, Gmail API, and
Vercel.

**Live:** https://bulkmailer-three.vercel.app/
