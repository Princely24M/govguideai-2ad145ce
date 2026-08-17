# GOVGUIDE AI 🇿🇦
<img width="800" height="800" style="float: right; margin: 10px;" alt="GovGuide Ai Logo" src="https://github.com/user-attachments/assets/7a06770c-dab0-4aca-9e33-762ccc64b778" />

## Your intelligent guide to understanding government services.

**GOVGUIDE AI** is an AI-powered public-service information assistant designed to help citizens understand government procedures, requirements, documents, application processes, service locations, and frequently asked questions through simple conversational interaction.

Instead of forcing users to navigate complicated government websites and documents, GOVGUIDE AI allows users to ask questions naturally and receive clear, structured guidance.

> **Ask. Understand. Know what to do next.**

---

## 📌 Project Overview

Government information may be available online, but it can often be difficult for citizens to find, interpret, and understand.

A citizen may ask:

* What documents do I need?
* How do I apply?
* Where do I apply?
* What are the requirements?
* How much does the service cost?
* What happens after I apply?
* Which government office should I visit?
* What do I need to bring with me?

GOVGUIDE AI aims to simplify this experience by providing a conversational interface for accessing and understanding public-service information.

### Example

**User:**

> What documents do I need to apply for a driver's licence?

**GOVGUIDE AI:**

The assistant should provide a structured response explaining the relevant requirements, application steps, important considerations, and—where available—official sources for verification.

---

# 🎯 Project Objectives

GOVGUIDE AI was developed as part of an **AI Bootcamp** focused on building practical AI solutions.

The project demonstrates the team's ability to:

* Understand AI fundamentals
* Apply prompt engineering
* Design conversational AI systems
* Build a real-world AI application
* Integrate an LLM
* Design user-centred experiences
* Implement authentication
* Store and manage conversations
* Track AI usage
* Apply responsible AI principles
* Document a software project professionally
* Use GitHub for collaboration and portfolio development

---

# 🚀 Core Features

## 🤖 Ask GovGuide

Visitors can interact with GOVGUIDE AI directly from the landing page without immediately creating an account.

This provides a low-friction way for users to experience the product.

### Guest flow

```text
Landing Page
      ↓
Ask GovGuide
      ↓
Temporary Conversation
      ↓
Ask Question
      ↓
AI Response
      ↓
Continue Conversation
```

Guest conversations are temporary and are not treated as persistent account history.

Users can create an account when they want to retain conversations.

---

# 👤 Account Creation & Authentication

Users can create an account or sign in to access persistent features.

Authenticated users can:

* Create conversations
* Save conversations
* View chat history
* Search conversations
* Archive conversations
* Manage their profile
* Manage appearance preferences
* View AI usage
* Delete conversations
* Sign out

### Authentication flow

```text
Landing Page
      ↓
Create Account / Sign In
      ↓
Authentication
      ↓
Authenticated Dashboard
      ↓
Personal Chat Workspace
```

---

# 💬 Conversation Management

Authenticated users can manage their conversations.

### Supported actions

* Start a new conversation
* View previous conversations
* Search conversations
* Open conversations
* Continue conversations
* Archive conversations
* View archived conversations
* Delete conversations

### Conversation model

```text
User
 │
 └── Conversation
       │
       ├── User Message
       ├── AI Response
       ├── User Message
       └── AI Response
```

Each conversation belongs to the authenticated user.

---

# 🔎 Conversation Search

Users can search their saved conversations.

Example:

```text
Search: passport
```

Possible results:

```text
Passport Application Requirements
Passport Renewal
Passport Application Process
```

The search functionality allows users to quickly return to previously discussed information.

---

# 📦 Chat Archiving

Users can archive conversations that they no longer want displayed in their active conversation list.

```text
Active Conversation
        ↓
      Archive
        ↓
Archived Conversation
```

Archiving is different from deletion.

Archived conversations remain associated with the user's account unless they are permanently deleted.

---

# 📊 AI Usage

GOVGUIDE AI provides users with visibility into their AI usage.

The system can display:

* Number of AI responses
* Input tokens
* Output tokens
* Total tokens

Example:

```text
AI RESPONSES
128

INPUT TOKENS
21,430

OUTPUT TOKENS
27,190

TOTAL TOKENS
48,620
```

Usage information should be calculated from actual AI provider metadata where available.

The application must never invent token statistics.

---

# ⚙️ Profile & Settings

Authenticated users can manage their account settings.

## Profile

Users can edit:

* Display name

---

## Appearance

Users can select:

* Light
* Dark
* System

### System mode

System mode follows the user's device or operating-system theme preference.

---

# ⚠️ Danger Zone

The settings area contains a dedicated Danger Zone for destructive actions.

Users can permanently delete their conversations.

Before deletion, the application must request confirmation.

```text
Delete all conversations?

All saved conversations will be permanently deleted.
This action cannot be undone.

[Cancel]

[Delete All Conversations]
```

The delete operation must only affect conversations belonging to the authenticated user.

---

# 🔐 Authentication & Security

Security is an important part of the GOVGUIDE AI architecture.

The application is designed around:

* Authentication
* Authorization
* Protected application areas
* User-specific data
* Secure database access
* Environment variables
* Database security policies

A user must never be able to access another user's:

* Conversations
* Messages
* Usage information
* Profile information

Frontend checks alone should not be considered sufficient authorization.

Database-level access controls should be used where supported.

---

# 🧠 AI Assistant Logic

The GOVGUIDE AI assistant follows a structured conversational process.

```text
USER QUESTION
      ↓
INPUT VALIDATION
      ↓
INTENT UNDERSTANDING
      ↓
CONVERSATION CONTEXT
      ↓
RELEVANT INFORMATION
      ↓
LLM PROCESSING
      ↓
RESPONSE VALIDATION
      ↓
STRUCTURED RESPONSE
      ↓
USER
```
<img width="1312" height="761" alt="ai-question-flow-diagram" src="https://github.com/user-attachments/assets/9e84dd67-35fd-4530-8ca6-630750e3ba3f" />

---

# 🧩 Conversational Context

The assistant should maintain context throughout a conversation.

### Example

**User:**

> How do I apply for a driver's licence?

**AI:**

Provides information about the application process.

**User:**

> Where do I apply?

The AI should understand that "where" refers to the driver's licence application.

**User:**

> What documents do I need?

The assistant should continue using the previous context.

This allows GOVGUIDE AI to behave as a conversational assistant rather than a simple question-and-answer search box.

---

# 📝 Prompt Engineering

GOVGUIDE AI uses structured prompt engineering to control the behaviour of the assistant.

The prompt structure follows:

```text
ROLE
 ↓
CONTEXT
 ↓
TASK
 ↓
CONSTRAINTS
 ↓
BEHAVIOUR
 ↓
OUTPUT FORMAT
```

### Example

```text
ROLE:
You are GOVGUIDE AI, a public-service information assistant.

CONTEXT:
Help users understand government services,
procedures, requirements and next steps.

TASK:
Answer the user's public-service question clearly.

CONSTRAINTS:
Do not fabricate requirements.
Do not invent fees, locations or procedures.
Do not present uncertain information as verified fact.

BEHAVIOUR:
Use simple language.
Break complicated procedures into steps.
Ask clarifying questions when necessary.
Identify uncertainty.

OUTPUT:
Provide a concise explanation,
requirements, steps, important notes
and sources where available.
```
<img width="1233" height="687" alt="prompt-engineering-diagram (1)" src="https://github.com/user-attachments/assets/ca037d1e-4a20-4345-8e13-c164b52510d2" />

---

# 🛡️ Responsible AI

GOVGUIDE AI is an informational assistant and is **not an official government authority**.

Government information can change.

Therefore, the assistant should:

* Avoid hallucinating information
* Avoid inventing requirements
* Avoid inventing government fees
* Avoid inventing office locations
* Communicate uncertainty
* Ask clarifying questions
* Encourage verification of important information
* Prefer authoritative sources where available

### Example

If the assistant cannot verify a current application fee, it should say:

> I couldn't verify the current fee. Please check the relevant official government service before applying.

It should not provide a made-up amount.

---

# 🎨 Premium UI/UX Design System

GOVGUIDE AI uses a custom **Premium UI/UX & Motion Design System**.

The visual identity is designed to communicate:

* Trust
* Clarity
* Intelligence
* Accessibility
* Precision
* Reliability
* Modern public service

The interface should feel like a premium digital public-service platform rather than a generic AI chatbot.

---

## Visual Language

The design system uses:

* Glassmorphism
* Frosted glass panels
* Gradient mesh backgrounds
* Soft lighting
* Ambient glow
* Layered depth
* Premium shadows
* Floating cards
* Modern typography
* Elegant whitespace
* Subtle motion
* Cinematic imagery where appropriate
* Abstract AI-inspired graphics

Visual effects are used selectively.

**Clarity always takes priority over decoration.**

---

# 🎬 Motion Design

Motion is designed to be:

* Smooth
* Calm
* Purposeful
* Responsive
* Accessible

Motion is used to communicate:

* Feedback
* Progress
* Hierarchy
* State changes
* Continuity

Examples include:

* AI thinking states
* Response streaming
* Button interactions
* Card transitions
* Page transitions
* File processing
* Progress indicators
* Toast notifications

---

# 🤖 AI Thinking State

Instead of using a generic loading animation, GOVGUIDE AI uses a branded AI activity state.

Example:

```text
◉ Finding the right information...
```

The interface may use subtle ambient lighting or a guidance indicator while the AI is processing.

---

# 📱 Responsive Design

GOVGUIDE AI is designed for:

### Desktop

* Expanded navigation
* Full chat workspace
* Multi-column layouts
* Richer motion effects

### Tablet

* Adaptive layouts
* Collapsible navigation
* Reduced motion complexity

### Mobile

* Full-width chat
* Navigation drawer
* Touch-friendly controls
* Simplified animations
* Mobile-friendly composer

Minimum touch target guidance:

```text
≈ 44px
```

Mouse-dependent effects should be disabled on touch devices.

---

# ♿ Accessibility

Accessibility is part of the design system.

The application aims to support:

* Keyboard navigation
* Visible focus states
* Semantic HTML
* Screen-reader compatibility
* Sufficient colour contrast
* Responsive typography
* Touch-friendly controls
* Reduced motion

The application should respect:

```text
prefers-reduced-motion
```

When reduced motion is enabled, decorative animations should be minimized or removed while essential feedback remains available.

---

# 🏗️ System Architecture

High-level architecture:

```text
┌──────────────────────────────────────┐
│              GOVGUIDE UI             │
│          React + TypeScript          │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│          APPLICATION LAYER           │
│                                      │
│ Chat │ Auth │ Profile │ Usage       │
│ Search │ Archive │ Settings         │
└───────────────┬───────────┬──────────┘
                │           │
                ▼           ▼
       ┌─────────────┐ ┌──────────────┐
       │  Supabase   │ │  AI Provider │
       │             │ │              │
       │ PostgreSQL  │ │     LLM      │
       │ Auth        │ │              │
       │ Security    │ │              │
       └─────────────┘ └──────────────┘
```

---

# 🛠️ Technology Stack

The recommended technology stack is:

| Layer            | Technology    |
| ---------------- | ------------- |
| Frontend         | React         |
| Language         | TypeScript    |
| Styling          | Tailwind CSS  |
| UI Components    | shadcn/ui     |
| Animation        | Framer Motion |
| Backend Platform | Supabase      |
| Database         | PostgreSQL    |
| Authentication   | Supabase Auth |
| AI               | LLM API       |
| Development      | Lovable       |
| Version Control  | Git + GitHub  |

The exact implementation may evolve during development.

---

# 🗄️ Data Structure

A simplified data model:

```text
USER
 │
 ├── PROFILE
 │
 ├── CONVERSATIONS
 │       │
 │       └── MESSAGES
 │
 └── USAGE
```

### Profile

```text
id
email
display_name
created_at
updated_at
```

### Conversations

```text
id
user_id
title
status
created_at
updated_at
archived_at
```

### Messages

```text
id
conversation_id
role
content
input_tokens
output_tokens
total_tokens
created_at
```

### Usage

```text
id
user_id
conversation_id
input_tokens
output_tokens
total_tokens
created_at
```

---

# 🔄 Main User Flows

## Guest Chat

```text
Landing Page
      ↓
Ask GovGuide
      ↓
Enter Question
      ↓
AI Processes Request
      ↓
AI Response
      ↓
Continue Chat
```

---

## Registered User

```text
Landing Page
      ↓
Create Account / Sign In
      ↓
Dashboard
      ↓
New Conversation
      ↓
Ask Question
      ↓
AI Response
      ↓
Conversation Saved
```

---

## Conversation History

```text
Dashboard
   ↓
Chat History
   ↓
Search / Browse
   ↓
Select Conversation
   ↓
Open Conversation
   ↓
Continue Chat
```

---

## Archive

```text
Conversation
      ↓
Archive
      ↓
Archived
      ↓
Restore or Delete
```

---

## Delete All Conversations

```text
Settings
    ↓
Danger Zone
    ↓
Delete All Conversations
    ↓
Confirmation
    ↓
Delete
    ↓
Conversations Removed
```

---

# 🧪 Testing Strategy

Testing should cover both the application and the AI.

## Functional Testing

Test:

* Account creation
* Login
* Logout
* New conversation
* Sending messages
* Chat history
* Search
* Archive
* Restore
* Profile editing
* Theme switching
* Usage display
* Delete conversations

---

## AI Testing

Test:

* Normal questions
* Follow-up questions
* Ambiguous questions
* Questions requiring clarification
* Unknown questions
* Out-of-scope questions
* Questions containing incorrect assumptions
* Questions requiring current information

---

## Security Testing

Verify that:

* Users cannot access other users' conversations
* Users cannot modify another user's profile
* Protected pages require authentication
* API secrets are not exposed
* Database policies correctly restrict user data

---

## Responsive Testing

Test the application on:

```text
Desktop
Tablet
Mobile
```

Check:

* Navigation
* Chat composer
* Message rendering
* Buttons
* Modals
* Settings
* Conversation history
* Accessibility

---

# 📁 Recommended Repository Structure

```text
govguide-ai/
│
├── public/
│   ├── images/
│   ├── icons/
│   └── favicon/
│
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── chat/
│   │   ├── auth/
│   │   ├── navigation/
│   │   └── settings/
│   │
│   ├── pages/
│   │   ├── Landing/
│   │   ├── Dashboard/
│   │   ├── Chat/
│   │   ├── Profile/
│   │   ├── Settings/
│   │   └── Usage/
│   │
│   ├── services/
│   │   ├── ai/
│   │   ├── auth/
│   │   └── conversations/
│   │
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── utils/
│
├── supabase/
│   ├── migrations/
│   └── functions/
│
├── docs/
│   ├── architecture.md
│   ├── ai-logic.md
│   ├── prompt-engineering.md
│   ├── database.md
│   ├── security.md
│   ├── testing.md
│   └── design-system.md
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

# 🔑 Environment Variables

Sensitive credentials must never be committed to GitHub.

Use an environment file locally.

Example:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

AI_API_KEY=
AI_MODEL=
```

Commit:

```text
.env.example
```

Do not commit:

```text
.env
```

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
```

## 2. Enter the project

```bash
cd govguide-ai
```

## 3. Install dependencies

```bash
npm install
```

## 4. Configure environment variables

Create a `.env` file using `.env.example` as a guide.

Add the required:

* Supabase configuration
* AI provider configuration

## 5. Start the development server

```bash
npm run dev
```

---

# 👥 Team

| Team Member  | Role                     | Primary Responsibilities                                                         |
| ------------ | ------------------------ | -------------------------------------------------------------------------------- |
| **Thenjiwe** | Product & AI/UX Lead     | Product requirements, user flows, AI behaviour, prompt engineering, UX direction |
| **Chichi** | Frontend & UI Developer  | React interface, responsive design, components, animations and accessibility     |
| **Princely**   | Backend & Data Developer | Database, authentication, profiles, conversations, security and usage data       |
| **Sinawo**   | Researcher & QA Lead | AI integration, token tracking, AI testing, edge cases and quality assurance     |

The team collaborates through GitHub and follows a shared development workflow.

---

# 🌱 Development Workflow

Recommended workflow:

```text
Issue
  ↓
Feature Branch
  ↓
Development
  ↓
Testing
  ↓
Pull Request
  ↓
Code Review
  ↓
Merge
```

Example branch:

```bash
git checkout -b feature/conversation-search
```

Example commit:

```bash
git commit -m "feat: add conversation search"
```

---

# 🎓 AI Bootcamp Learning Outcomes

This project demonstrates practical application of:

### AI Foundations

* Artificial Intelligence
* Generative AI
* Large Language Models
* Conversational AI

### Prompt Engineering

* Role definition
* Context
* Constraints
* Output formatting
* Behaviour instructions
* Conversation context

### Software Development

* React
* TypeScript
* Database design
* Authentication
* API integration
* Responsive development

### AI Product Design

* User-centred design
* Conversation design
* Responsible AI
* Accessibility
* AI transparency

### Professional Development

* GitHub
* Documentation
* Team collaboration
* Portfolio development
* Project presentation

---

# ⚠️ Project Limitations

GOVGUIDE AI is an AI-powered informational prototype and should **not be considered an official government authority**.

AI-generated information can potentially be:

* Incorrect
* Incomplete
* Outdated
* Misinterpreted

Users should verify important information with the relevant official government authority before making decisions, paying fees, travelling to an office, or submitting applications.

---

# 🔮 Future Development

Future versions could include:

* Retrieval-Augmented Generation (RAG)
* Verified government data sources
* Automatic source citations
* Multilingual support
* Voice interaction
* Document upload and analysis
* Government office locator
* Service eligibility checking
* Personalized application checklists
* Service reminders
* Government-service directory
* More advanced analytics
* Official-source monitoring

---

# 🌍 Vision

GOVGUIDE AI aims to make government information easier for ordinary citizens to understand and act upon.

The long-term experience is built around:

```text
WHAT?
  ↓
WHY?
  ↓
WHERE?
  ↓
HOW?
  ↓
WHAT NEXT?
```

The goal is not simply to give users an AI-generated answer.

The goal is to help users understand the information and confidently identify their **next step**.

---

# ⭐ Project Status

**Project:** GOVGUIDE AI

**Type:** AI-powered Public-Service Information Assistant

**Stage:** AI Bootcamp Project

**Development Status:** Active Development

**Primary Platform:** Web

**Target Devices:** Desktop, Tablet and Mobile

---

## GOVGUIDE AI

### Ask. Understand. Know what to do next.

Built as a practical demonstration of **AI, prompt engineering, conversational design, software development and responsible AI.**
