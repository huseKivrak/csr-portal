# AMP Customer Service Dashboard

A comprehensive Customer Service Representative (CSR) portal for AMP, a membership and loyalty platform designed for car washes. This application enables CSRs to efficiently manage customer accounts, subscriptions, and resolve customer inquiries.

## Features

- **User Management**

  - View a list of all registered users
  - Search and filter users by various criteria
  - View detailed user profiles

- **Account Management**

  - View and edit customer account information
  - Manage account details
  - Quick access to all required forms through searchbar or hotkeys

- **Subscription Management**

  - View active vehicle subscriptions
  - Add, remove, or transfer subscriptions
  - Handle subscription payment issues

- **Purchase History**
  - Track customer transactions
  - Review purchase details
  - Resolve billing questions

## Tech Stack

### Frontend

- **Next.js 15**
- **React 19**
- **Tailwind CSS**
- **shadcn/ui**
- **Tanstack Table**
- **React Hook Form**
- **Zod**

### Backend

- **Next.js Server Actions**
- **Drizzle ORM**
- **PostgreSQL**
- **Supabase Database**

### Tools & Utilities

- **TypeScript**
- **ESLint**
- **Faker.js**

## Usage

### User Access:

- Find a user by name using the autocomplete searchbar
- Navigate to the users page (`/users`) for a table of all users
  - Click on a user to view their detailed profile

### User Management:

- From a user's profile, edit their account information or add a note
- Access quick actions from the user actions searchbar, with optional hotkeys
  - shift+1 -> shift+5 for instant access to most relevant forms.
- View and manage subscription details and payment history via the tabbed card layout below the user info card

## Known Issues

- Cancelling user accounts works but shows an immediate 404 on their page.
  - This is due to tables currently filtering for active users.
- New or edited CSR notes are sometimes not immediately reflected on user's profile, or do not reflect previous notes.
- Some layouts are not mobile-friendly.
- Subscriptions can be transferred to vehicles with active subscriptions (giving them multiple)
- Theme toggling is buggy on mobile.
- Incongruent seed data - Data is sufficient for demo but may show conflicting info (purchases/washes may not align with subscription, etc.)

## Future Improvements

- Implement currently unused components:
  - **Success Card**: animation for form submissions with restart button.
    - this works well but was not implemented due to time constraints and the addition of the user actions section.
  - **Subscription Plan Pie Chart**: breakdown of active subscriptions by plan type
    - Currently the only dynamic visualization and out of place in current layout.
- Add CSR documentation
  - Guides, FAQs, more step-by-step directions on forms, etc.
- Testing
  - Unit
  - Integration
- Error handling
  - more robust checks in server actions
  - improve and standardize zod validation schemas
- Styling
  - fix colors in dark mode
  - add appealing background, theme overall
- Seed Data
  - fix inconsistencies in seeded data (incongruent purchase/wash history, subscriptions, etc.)
