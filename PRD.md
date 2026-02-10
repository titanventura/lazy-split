# SplitLink - Product Requirements Document

## Executive Summary

**Product Name:** SplitLink  
**Version:** 1.0 (MVP)  
**Target Market:** India (UPI payments)  
**Platform:** Web-based (mobile-first)  

**One-line description:** Zero-friction split payment tracker that lives in WhatsApp/Telegram via shareable links - no app downloads, no accounts required.

---

## Technical Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Headless UI or shadcn/ui
- **State Management:** React hooks (useState, useContext if needed)
- **Forms:** React Hook Form + Zod validation

### Backend
- **API:** Next.js API Routes (serverless functions)
- **Database:** PostgreSQL with Prisma ORM
- **Alternative DB:** MongoDB (if preferred for faster prototyping)

### Deployment
- **Platform:** Fly.io
- **Environment:** Node.js 18+
- **CI/CD:** GitHub Actions (optional for MVP)

### Third-party Services
- None required for MVP (future: analytics, monitoring)

---

## Database Schema

### Table: `splits`

```prisma
model Split {
  id                String        @id @default(cuid())
  description       String
  totalAmount       Int           // Amount in paise (₹2400 = 240000)
  numberOfPeople    Int
  perPersonAmount   Int           // Auto-calculated
  creatorName       String
  creatorUpiId      String
  createdAt         DateTime      @default(now())
  participants      Participant[]
}

model Participant {
  id          String   @id @default(cuid())
  splitId     String
  split       Split    @relation(fields: [splitId], references: [id], onDelete: Cascade)
  name        String
  hasPaid     Boolean  @default(false)
  markedPaidAt DateTime?
  
  @@index([splitId])
}
```

### Data Validation Rules
- `description`: 1-100 characters, required
- `totalAmount`: Positive integer, max 10,000,000 paise (₹100,000)
- `numberOfPeople`: Integer between 2-50
- `perPersonAmount`: Auto-calculated as `totalAmount / numberOfPeople` (rounded down)
- `creatorName`: 1-50 characters, required
- `creatorUpiId`: Valid UPI format (e.g., `username@bank` or 10-digit mobile number)
- `participant.name`: 1-50 characters, required

---

## API Endpoints

### 1. Create Split
**Endpoint:** `POST /api/splits`

**Request Body:**
```json
{
  "description": "Dinner at BBQ Nation",
  "totalAmount": 240000,
  "numberOfPeople": 3,
  "participantNames": ["Rahul", "Priya", "Amit"], // Optional
  "creatorName": "Rahul Kumar",
  "creatorUpiId": "rahul@paytm"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clx9k2m3n0000",
    "shareUrl": "https://splitlink.app/split/clx9k2m3n0000"
  }
}
```

**Validation:**
- All fields required except `participantNames`
- If `participantNames` provided, length must match `numberOfPeople`
- UPI ID must match regex: `^[a-zA-Z0-9._-]+@[a-zA-Z]+$` OR `^\d{10}$`

---

### 2. Get Split Details
**Endpoint:** `GET /api/splits/[id]`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clx9k2m3n0000",
    "description": "Dinner at BBQ Nation",
    "totalAmount": 240000,
    "numberOfPeople": 3,
    "perPersonAmount": 80000,
    "creatorName": "Rahul Kumar",
    "creatorUpiId": "rahul@paytm",
    "createdAt": "2026-02-09T10:30:00Z",
    "participants": [
      {
        "id": "p1",
        "name": "Rahul",
        "hasPaid": true,
        "markedPaidAt": "2026-02-09T10:35:00Z"
      },
      {
        "id": "p2",
        "name": "Priya",
        "hasPaid": false,
        "markedPaidAt": null
      }
    ],
    "stats": {
      "totalPaid": 1,
      "totalPending": 2,
      "amountCollected": 80000
    }
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Split not found"
}
```

---

### 3. Add Participant
**Endpoint:** `POST /api/splits/[id]/participants`

**Request Body:**
```json
{
  "name": "Amit Kumar"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "participantId": "p3",
    "name": "Amit Kumar",
    "hasPaid": false
  }
}
```

**Business Logic:**
- Only allow if current participant count < `numberOfPeople`
- Check if name already exists in participant list (case-insensitive)
- If duplicate, return existing participant ID

---

### 4. Mark as Paid
**Endpoint:** `PATCH /api/splits/[id]/participants/[participantId]`

**Request Body:**
```json
{
  "hasPaid": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "participantId": "p3",
    "name": "Amit Kumar",
    "hasPaid": true,
    "markedPaidAt": "2026-02-09T11:00:00Z"
  }
}
```

**Business Logic:**
- Only allow toggling `hasPaid` boolean
- Set `markedPaidAt` timestamp when marking as paid
- Clear `markedPaidAt` when unmarking

---

## Page Specifications

### Page 1: Landing Page `/`

**Purpose:** Convert visitors into split creators

**SEO Meta Tags:**
```html
<title>SplitLink - Split Bills Instantly in WhatsApp</title>
<meta name="description" content="No apps, no accounts. Create split payment links for group expenses and share in WhatsApp. Track who paid with one click." />
<meta property="og:title" content="SplitLink - Split Bills Instantly" />
<meta property="og:description" content="Split group expenses with shareable links. No apps needed." />
<meta property="og:image" content="/og-image.png" />
```

**Layout Structure:**
```
┌─────────────────────────────┐
│ Header                      │
│   [Logo] SplitLink          │
│                             │
│ Hero Section                │
│   H1: Split bills instantly │
│   Subtitle: No apps needed  │
│   [Create a Split] CTA      │
│                             │
│ How It Works (3 steps)      │
│   1. Create split           │
│   2. Share WhatsApp link    │
│   3. Track payments         │
│                             │
│ Example Split Preview       │
│   [View Demo Split] link    │
│                             │
│ Footer                      │
│   Made in India • UPI only  │
└─────────────────────────────┘
```

**Components Required:**
- `Header` - Logo + optional nav
- `HeroSection` - Title, subtitle, primary CTA
- `HowItWorksSection` - 3 numbered steps with icons
- `Footer` - Simple text footer

**CTA Behavior:**
- Click "Create a Split" → Navigate to `/create`

---

### Page 2: Create Split `/create`

**Purpose:** Capture split details in <30 seconds

**SEO Meta Tags:**
```html
<title>Create a Split - SplitLink</title>
<meta name="robots" content="noindex" />
```

**Form Fields:**

1. **Description**
   - Type: Text input
   - Placeholder: "Dinner at BBQ Nation"
   - Max length: 100 characters
   - Required: Yes

2. **Total Amount**
   - Type: Number input (INR)
   - Placeholder: "2400"
   - Prefix: "₹" symbol
   - Min: 10, Max: 100000
   - Required: Yes
   - Input mode: `numeric` (mobile keyboard)

3. **Number of People**
   - Type: Radio buttons (2-6) + "More" option
   - If "More" selected, show number input (max 50)
   - Default: 2
   - Required: Yes

4. **Participant Names** (Optional)
   - Type: Dynamic text inputs
   - Show only if user clicks "Add names"
   - Number of inputs = `numberOfPeople`
   - Each input: max 50 characters

5. **Your UPI ID**
   - Type: Text input
   - Placeholder: "yourname@paytm or 9876543210"
   - Pattern validation: UPI format
   - Required: Yes
   - Help text: "Your UPI ID or phone number linked to UPI"

6. **Your Name**
   - Type: Text input
   - Placeholder: "Rahul Kumar"
   - Max length: 50 characters
   - Required: Yes
   - Help text: "Name people will pay to"

**Real-time Calculation Display:**
```
Each person pays: ₹800
```
- Position: Above submit button
- Update on `totalAmount` or `numberOfPeople` change

**Submit Button:**
- Text: "Create & Share Link"
- Disabled state: If form invalid
- Loading state: Show spinner during API call
- Success: Show success toast + redirect

**Form Validation (Client-side):**
```typescript
const schema = z.object({
  description: z.string().min(1).max(100),
  totalAmount: z.number().min(10).max(100000),
  numberOfPeople: z.number().min(2).max(50),
  participantNames: z.array(z.string().max(50)).optional(),
  creatorUpiId: z.string().regex(/^[a-zA-Z0-9._-]+@[a-zA-Z]+$|^\d{10}$/),
  creatorName: z.string().min(1).max(50)
});
```

**Success Flow:**
1. Form submits → API call to `POST /api/splits`
2. Receive split ID
3. Auto-copy share URL to clipboard
4. Show toast: "Link copied! Share it now"
5. Navigate to `/split/[id]?creator=true`

**Error Handling:**
- Network error: Show retry button
- Validation error: Display inline error messages
- Server error: Show generic error message

---

### Page 3: Split View `/split/[id]`

**Purpose:** Main page participants see when clicking shared link

**SEO Meta Tags (Dynamic):**
```html
<title>{description} - ₹{perPersonAmount} per person</title>
<meta name="description" content="{creatorName} is waiting for your payment of ₹{perPersonAmount} for {description}" />
<meta property="og:title" content="₹{perPersonAmount} - {description}" />
<meta property="og:description" content="{creatorName} created a split. Click to view details." />
```

**First Visit Detection:**
- Check localStorage for `participantId` for this split
- If not found → Show "Enter Name" modal
- If found → Load participant data

**Modal: Enter Name**
```
┌─────────────────────────┐
│  What's your name?      │
│  [_________________]    │
│  [Confirm]              │
└─────────────────────────┘
```
- After confirm: Call `POST /api/splits/[id]/participants`
- Store `participantId` in localStorage
- Close modal, show main content

**Main Content Layout:**
```
┌─────────────────────────────┐
│ ← Back to Home              │
│                             │
│ Split Details Card          │
│ ┌─────────────────────────┐ │
│ │ Dinner at BBQ Nation    │ │
│ │ Created by Rahul Kumar  │ │
│ │                         │ │
│ │ Total: ₹2,400           │ │
│ │ Your share: ₹800        │ │ ← Highlighted
│ └─────────────────────────┘ │
│                             │
│ Payment Action              │
│ ┌─────────────────────────┐ │
│ │ [💰 Pay ₹800 Now] ────  │ │ ← PRIMARY CTA (Big, green)
│ │                         │ │
│ │ Or pay manually:        │ │
│ │ rahul@paytm    [Copy]   │ │ ← Secondary option
│ │ Pay to: Rahul Kumar     │ │
│ └─────────────────────────┘ │
│                             │
│ Who's Paid?                 │
│ ┌─────────────────────────┐ │
│ │ ✅ Rahul (Creator)      │ │
│ │ ⏳ Priya                │ │
│ │ ⏳ Amit (You)           │ │ ← Highlight user
│ └─────────────────────────┘ │
│ 1/3 people paid             │
│                             │
│ [✓ Mark as Paid] ────────── │ ← If not paid
│ OR                          │
│ [Marked as Paid ✓] ──────── │ ← If paid (disabled)
│                             │
│ [🔄 Refresh] ───────────────│ │
│ [Share Link Again]          │
└─────────────────────────────┘
```

**Component Behavior:**

1. **Pay Now Button (Primary Action)**
   - Displays: "Pay ₹{perPersonAmount} Now"
   - Click → Open UPI deep link with pre-filled details
   - Deep link format: `upi://pay?pa={upiId}&pn={creatorName}&am={amount}&cu=INR&tn={description}`
   - User's phone shows UPI app chooser (Gpay, PhonePe, Paytm, etc.)
   - Selected app opens with all details pre-filled
   - User just needs to authenticate and confirm payment
   - Fallback: If UPI apps not installed, show toast: "Please install a UPI app (GPay, PhonePe, Paytm)"

2. **Copy UPI Button (Secondary Option)**
   - Click → Copy UPI ID to clipboard
   - Show toast: "UPI ID copied!"
   - User can manually open their UPI app and paste

3. **Mark as Paid Button**
   - Click → Call `PATCH /api/splits/[id]/participants/[participantId]`
   - Optimistic update: Immediately show checkmark
   - Show toast: "Marked as paid! Rahul will see this."
   - Disable button after marking

4. **Refresh Button**
   - Click → Refetch split data from API
   - Show loading spinner on button
   - Update participant list

5. **Share Link Button**
   - Click → Copy current URL to clipboard
   - Show toast: "Link copied!"

**Visual States:**
- Paid participant: Green checkmark ✅, green background
- Pending participant: Grey clock ⏳, grey background
- Current user: Slight border highlight or "(You)" label

---

### Page 4: Creator Dashboard `/split/[id]?creator=true`

**Purpose:** View payment status at a glance

**URL Detection:**
- Check for `?creator=true` query parameter
- OR check if split was created in this browser session (localStorage)

**Layout:**
```
┌─────────────────────────────┐
│ ← Back to Home              │
│                             │
│ Your Split                  │
│ Dinner at BBQ Nation        │
│                             │
│ Stats Card                  │
│ ┌─────────────────────────┐ │
│ │ 2/3 people paid         │ │
│ │ ₹1,600 collected        │ │
│ │ ₹800 pending            │ │
│ └─────────────────────────┘ │
│                             │
│ Participant List            │
│ ┌─────────────────────────┐ │
│ │ ✅ Rahul (You) - ₹800   │ │
│ │ ✅ Priya - ₹800         │ │
│ │    Paid 5 mins ago      │ │
│ │ ⏳ Amit - ₹800          │ │
│ └─────────────────────────┘ │
│                             │
│ Your Payment Details        │
│ UPI: rahul@paytm [Copy]     │
│ Name: Rahul Kumar           │
│                             │
│ [🔄 Refresh]                │
│ [📋 Share Link]             │
└─────────────────────────────┘
```

**Stats Calculation:**
- `totalPaid`: Count of participants where `hasPaid = true`
- `amountCollected`: `totalPaid * perPersonAmount`
- `amountPending`: `totalAmount - amountCollected`

**Celebration State:**
- If all participants paid → Show confetti animation or success banner
- Message: "🎉 Everyone paid! Split complete."

---

## Component Specifications

### 1. `SplitCard`
**Props:**
```typescript
interface SplitCardProps {
  description: string;
  creatorName: string;
  totalAmount: number;
  perPersonAmount: number;
  highlightAmount?: boolean;
}
```

**Styling:**
- Border radius: 12px
- Shadow: soft drop shadow
- Padding: 24px
- Background: White or light grey

---

### 2. `ParticipantList`
**Props:**
```typescript
interface ParticipantListProps {
  participants: Array<{
    id: string;
    name: string;
    hasPaid: boolean;
    markedPaidAt?: string;
  }>;
  currentUserId?: string;
}
```

**Behavior:**
- Render list of participants
- Highlight current user with "(You)" label
- Show checkmark or clock icon based on `hasPaid`
- Display timestamp if `markedPaidAt` exists (e.g., "Paid 5 mins ago")

---

### 3. `CopyButton`
**Props:**
```typescript
interface CopyButtonProps {
  text: string;
  label: string;
  successMessage?: string;
}
```

**Behavior:**
- Click → Copy `text` to clipboard
- Show toast with `successMessage` (default: "Copied!")
- Icon: Copy icon that animates to checkmark

---

### 4. `StatusBadge`
**Props:**
```typescript
interface StatusBadgeProps {
  status: 'paid' | 'pending';
}
```

**Styling:**
- Paid: Green background, green text, checkmark icon
- Pending: Grey background, grey text, clock icon
- Border radius: 6px
- Padding: 4px 8px

---

### 5. `AmountDisplay`
**Props:**
```typescript
interface AmountDisplayProps {
  amount: number; // in paise
  size?: 'sm' | 'md' | 'lg';
  prefix?: string; // default: "₹"
}
```

**Formatting:**
- Convert paise to rupees: `amount / 100`
- Format with commas: "₹2,400"
- Font: Mono for clarity

---

### 6. `PayButton`
**Props:**
```typescript
interface PayButtonProps {
  upiId: string;
  payeeName: string;
  amount: number; // in paise
  description: string;
  onPaymentInitiated?: () => void;
}
```

**Behavior:**
- Generates UPI deep link with all parameters
- Primary CTA styling (large, green, prominent)
- Shows amount in button text: "Pay ₹800 Now"
- Click → Open UPI deep link
- Handles case where no UPI apps installed (show error toast)
- Optional callback when payment is initiated

**Styling:**
- Full width on mobile
- Minimum height: 56px (easy to tap)
- Green background (#10B981)
- White text, bold font
- Slight shadow for depth
- Loading state while opening UPI app

---

## Utility Functions

### 1. Currency Formatting
```typescript
function formatCurrency(amountInPaise: number): string {
  const rupees = amountInPaise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees);
}
```

### 2. UPI Validation
```typescript
function validateUpiId(upiId: string): boolean {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]+$/;
  const phoneRegex = /^\d{10}$/;
  return upiRegex.test(upiId) || phoneRegex.test(upiId);
}
```

### 3. Share Link Generation
```typescript
function generateShareUrl(splitId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://splitlink.app';
  return `${baseUrl}/split/${splitId}`;
}
```

### 4. UPI Deep Link Generation
```typescript
function generateUpiDeepLink(params: {
  upiId: string;
  name: string;
  amount: number; // in paise
  description: string;
}): string {
  const amountInRupees = (params.amount / 100).toFixed(2);
  
  const upiParams = new URLSearchParams({
    pa: params.upiId,           // Payee address (UPI ID)
    pn: params.name,            // Payee name
    am: amountInRupees,         // Amount in rupees
    cu: 'INR',                  // Currency
    tn: params.description,     // Transaction note
  });
  
  return `upi://pay?${upiParams.toString()}`;
}

// Usage example:
// generateUpiDeepLink({
//   upiId: 'rahul@paytm',
//   name: 'Rahul Kumar',
//   amount: 80000, // ₹800 in paise
//   description: 'Dinner at BBQ Nation'
// })
// Returns: upi://pay?pa=rahul@paytm&pn=Rahul+Kumar&am=800.00&cu=INR&tn=Dinner+at+BBQ+Nation
```

### 5. Copy to Clipboard
```typescript
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
}
```

---

## User Flows (Detailed)

### Flow 1: Creator Creates Split

**Steps:**
1. User lands on `/` homepage
2. Clicks "Create a Split" CTA
3. Navigates to `/create`
4. Fills form:
   - Description: "Dinner at BBQ Nation"
   - Total: ₹2400
   - People: 3
   - Names (optional): Rahul, Priya, Amit
   - UPI: rahul@paytm
   - Name: Rahul Kumar
5. Sees real-time calculation: "Each person pays: ₹800"
6. Clicks "Create & Share Link"
7. API creates split, returns ID
8. Link auto-copied to clipboard
9. Toast appears: "Link copied! Share it now"
10. Navigates to `/split/[id]?creator=true`
11. Sees creator dashboard with stats
12. User pastes link in WhatsApp group

**Technical Implementation:**
- Form validation with Zod
- Optimistic UI: Show loading state on button
- Error handling: Network errors, validation errors
- Success: Redirect with split ID in URL

---

### Flow 2: Participant Joins and Pays

**Steps:**
1. Participant clicks shared link in WhatsApp
2. Link opens in browser: `/split/[id]`
3. Page loads (SSR for fast load)
4. Modal appears: "What's your name?"
5. Participant enters "Amit"
6. Clicks "Confirm"
7. API creates participant record
8. Modal closes
9. Participant sees:
   - Split details
   - Amount to pay: ₹800
   - Big "Pay ₹800 Now" button (green, prominent)
   - Creator's UPI ID below (as fallback)
10. Clicks "Pay ₹800 Now"
11. UPI deep link opens → Phone shows app chooser
12. Participant selects Gpay/PhonePe/Paytm
13. App opens with ALL details pre-filled:
    - Recipient: Rahul Kumar (rahul@paytm)
    - Amount: ₹800.00
    - Note: "Dinner at BBQ Nation"
14. Participant just authenticates (PIN/fingerprint) and confirms
15. Payment sent ✓
16. App closes, returns to browser
17. Participant clicks "Mark as Paid"
18. API updates participant status
19. Button changes to "Marked as Paid ✓" (disabled)
20. Sees green checkmark next to their name

**Alternative Flow (Manual Payment):**
- If UPI apps not installed OR participant prefers manual:
- Clicks "Copy" button next to UPI ID
- Opens UPI app separately
- Manually enters details and pays
- Returns and marks as paid

**Technical Implementation:**
- localStorage to persist participant ID
- UPI deep link with all parameters pre-filled
- Fallback for users without UPI apps installed
- Optimistic UI for "Mark as Paid"
- Modal component with focus trap
- Mobile detection for UPI app availability

---

### Flow 3: Creator Checks Status

**Steps:**
1. Creator opens dashboard (bookmark or link)
2. Lands on `/split/[id]?creator=true`
3. Sees current stats: "1/3 paid • ₹800 collected"
4. Reviews participant list with status
5. Clicks "Refresh" button
6. API fetches latest data
7. Stats update: "2/3 paid • ₹1,600 collected"
8. Sees Priya marked as paid (new)
9. Amit still pending
10. Can share link again if needed
11. Later: Clicks refresh again
12. All 3 paid → Sees celebration state: "🎉 Everyone paid! Split complete."

**Technical Implementation:**
- Manual refresh button (no auto-polling)
- Show loading state during refresh
- Update stats calculation after data fetch
- Celebration component (confetti or banner) when fully paid
- Optional: Store last viewed timestamp in localStorage

---

## Edge Cases & Error Handling

### 1. Split Not Found
- Scenario: User visits `/split/invalid-id`
- Response: 404 page
- Message: "This split doesn't exist or has been deleted"
- CTA: "Create a new split"

### 2. Duplicate Participant Name
- Scenario: Two people try to add same name
- Response: Return existing participant ID
- UX: Show warning: "Someone already joined as 'Amit'"
- Allow: Let them proceed (maybe it's same person on different device)

### 3. Participant Limit Reached
- Scenario: More people try to join than `numberOfPeople`
- Response: API returns error
- UX: Show message: "This split is full (3/3 people)"
- Action: Suggest contacting creator

### 4. Invalid UPI ID Format
- Scenario: User enters invalid UPI
- Validation: Client-side + server-side
- UX: Inline error: "Please enter valid UPI ID (e.g., name@bank) or 10-digit mobile number"

### 5. Network Failure
- Scenario: API call fails
- UX: Show retry button
- Message: "Something went wrong. Please try again."
- Action: Allow manual retry

### 6. Very Long Description
- Scenario: User enters 500 character description
- Validation: Max 100 characters
- UX: Character counter below input
- Error: "Description must be 100 characters or less"

### 7. Split with 1 Person
- Scenario: User selects 1 person
- Validation: Min 2 people
- UX: Disable submit button
- Message: "Need at least 2 people for a split"

### 8. Unmark as Paid
- Scenario: User accidentally marked as paid
- Feature: Allow toggling `hasPaid` back to false
- UX: Change button to "Unmark as Paid" when paid
- Confirmation: Optional confirmation modal

---

## Mobile Optimization

### Responsive Breakpoints
```css
- Mobile: < 640px (default)
- Tablet: 640px - 1024px
- Desktop: > 1024px
```

### Mobile-Specific Features
1. **Tap Targets**: Minimum 44x44px for all buttons
2. **Input Types**: 
   - Amount field: `type="number" inputmode="numeric"`
   - UPI field: `type="text" inputmode="text"`
3. **Bottom Navigation**: Sticky CTA buttons at bottom (thumb zone)
4. **No Horizontal Scroll**: All content fits viewport width
5. **Touch Gestures**: Pull-to-refresh for split view (optional)

### Mobile Testing Checklist
- [ ] Forms work with mobile keyboard
- [ ] Copy buttons work on iOS and Android
- [ ] Share functionality uses native share API
- [ ] Page load time < 2 seconds on 3G
- [ ] Text readable without zooming (16px minimum)

---

## UPI Deep Linking Implementation

### UPI URI Scheme Format
```
upi://pay?pa=<PAYEE_ADDRESS>&pn=<PAYEE_NAME>&am=<AMOUNT>&cu=<CURRENCY>&tn=<NOTE>
```

**Parameters:**
- `pa` (required): Payee UPI address (e.g., `rahul@paytm`)
- `pn` (required): Payee name (e.g., `Rahul Kumar`)
- `am` (required): Amount in rupees (e.g., `800.00`)
- `cu` (required): Currency code (`INR`)
- `tn` (optional): Transaction note/description (e.g., `Dinner at BBQ Nation`)

### Implementation Example
```typescript
// Component implementation
const PayButton = ({ upiId, payeeName, amount, description }: PayButtonProps) => {
  const handlePay = () => {
    const amountInRupees = (amount / 100).toFixed(2);
    
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amountInRupees}&cu=INR&tn=${encodeURIComponent(description)}`;
    
    // Try to open UPI app
    window.location.href = upiUrl;
    
    // Fallback detection (optional)
    setTimeout(() => {
      // If still on page after 2s, UPI apps might not be installed
      if (document.hasFocus()) {
        toast.error('Please install a UPI app (GPay, PhonePe, Paytm)');
      }
    }, 2000);
  };
  
  return (
    <button onClick={handlePay} className="pay-button">
      Pay ₹{(amount / 100).toFixed(0)} Now
    </button>
  );
};
```

### Browser & App Support

**Android:**
- Works on all modern browsers (Chrome, Firefox, Samsung Internet)
- Opens app chooser showing all installed UPI apps
- User selects preferred app (GPay, PhonePe, Paytm, etc.)

**iOS:**
- Safari: Works with UPI apps that support deep links
- Chrome iOS: May have limitations, test thoroughly
- Most major UPI apps support iOS deep linking

### Edge Cases to Handle

1. **No UPI Apps Installed**
   - Deep link fails silently
   - Use timeout detection to show helpful message
   - Provide fallback: "Copy UPI ID" option

2. **Multiple UPI Apps**
   - Android shows app chooser automatically
   - iOS may use default app or show system picker
   - Let user choose their preferred app

3. **Amount Formatting**
   - Always use 2 decimal places: `800.00` not `800`
   - UPI apps expect proper decimal format
   - Max amount: Check UPI limits (usually ₹1,00,000 per transaction)

4. **Special Characters in Description**
   - URL encode all parameters
   - Keep description under 50 characters
   - Avoid special characters that break URLs

### Testing Checklist
- [ ] Test with GPay (most popular)
- [ ] Test with PhonePe
- [ ] Test with Paytm
- [ ] Test on Android Chrome
- [ ] Test on iOS Safari
- [ ] Test with no UPI apps installed
- [ ] Verify amount shows correctly in app
- [ ] Verify description appears in transaction
- [ ] Test special characters in description

### Fallback Strategy
```typescript
const PaymentSection = ({ upiId, amount, ... }) => {
  return (
    <div>
      {/* Primary option */}
      <PayButton {...props} />
      
      {/* Fallback option */}
      <div className="or-divider">Or pay manually:</div>
      <div className="upi-details">
        <span>{upiId}</span>
        <CopyButton text={upiId} />
      </div>
    </div>
  );
};
```

---

## SEO & Social Sharing

### Open Graph Tags (per page)

**Split View Page:**
```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://splitlink.app/split/[id]" />
<meta property="og:title" content="₹800 - Dinner at BBQ Nation" />
<meta property="og:description" content="Rahul created a split. Click to view and pay." />
<meta property="og:image" content="https://splitlink.app/api/og/[id]" />
<meta name="twitter:card" content="summary_large_image" />
```

### Dynamic OG Image Generation
- Create API route: `/api/og/[id]`
- Generate image with:
  - Split description
  - Amount per person
  - Creator name
  - QR code (optional)
- Use `@vercel/og` or similar library

### Structured Data (JSON-LD)
```json
{
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "name": "SplitLink",
  "description": "Split payment tracker for group expenses",
  "url": "https://splitlink.app"
}
```

---

## Performance Requirements

### Page Load Targets
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1

### Optimization Strategies
1. **Server-Side Rendering**: Use Next.js SSR for split pages
2. **Image Optimization**: Use `next/image` for all images
3. **Code Splitting**: Lazy load non-critical components
4. **Caching**: Cache split data for 60 seconds (ISR)
5. **Compression**: Enable gzip/brotli compression
6. **CDN**: Use Fly.io's edge network

---

## Security Considerations

### Data Privacy
- No user authentication = no personal data stored
- Participant names are public within split context
- UPI IDs visible to all participants (by design)

### Input Sanitization
- Sanitize all user inputs to prevent XSS
- Use Zod validation on API routes
- Escape HTML in descriptions

### Rate Limiting
- Limit split creation: 10 per IP per hour
- Limit participant addition: 20 per split ID per hour
- Prevent CSRF with tokens (if needed)

### HTTPS Only
- Enforce HTTPS redirects
- Set secure cookie flags
- Use HSTS headers

---

## Analytics & Monitoring (Future)

### Key Metrics to Track
1. **Conversion Funnel**:
   - Landing page views
   - Create page visits
   - Splits created
   - Splits with ≥1 payment marked
   - Splits fully paid

2. **Engagement**:
   - Average time to create split
   - Share link click-through rate
   - Participant join rate
   - Payment marking rate
   - **Pay Button Usage**: % of users clicking "Pay Now" vs "Copy UPI"
   - **Payment Method**: Direct UPI link vs manual payment
   - App chooser interactions (if trackable)

3. **Technical**:
   - API response times
   - Error rates per endpoint
   - Page load times
   - Mobile vs desktop usage

### Recommended Tools (Post-MVP)
- Posthog or Mixpanel for product analytics
- Sentry for error tracking
- Vercel Analytics for performance

---

## Deployment Configuration

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# App
NEXT_PUBLIC_BASE_URL="https://splitlink.app"
NODE_ENV="production"

# Optional
SENTRY_DSN=""
ANALYTICS_ID=""
```

### Fly.io Configuration (`fly.toml`)
```toml
app = "splitlink"
primary_region = "bom" # Mumbai

[build]
  builder = "heroku/buildpacks:20"

[env]
  NODE_ENV = "production"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

### Database Migration
```bash
# Initial migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

---

## Testing Strategy

### Unit Tests
- Test utility functions: `formatCurrency`, `validateUpiId`
- Test API route handlers with mock DB
- Test component rendering with React Testing Library

### Integration Tests
- Test create split flow end-to-end
- Test participant joining and marking paid
- Test data persistence and retrieval

### Manual Testing Checklist
- [ ] Create split with 2-6 people
- [ ] Create split with custom names
- [ ] Share link via WhatsApp/Telegram
- [ ] Join split as new participant
- [ ] Mark as paid, verify status updates
- [ ] Test on iOS Safari, Chrome Android
- [ ] Test with poor network (3G throttle)
- [ ] Verify copy-to-clipboard works
- [ ] Test creator dashboard stats accuracy

---

## Launch Checklist

### Pre-launch
- [ ] Domain registered and DNS configured
- [ ] SSL certificate active
- [ ] Database provisioned and migrated
- [ ] Environment variables set
- [ ] App deployed to Fly.io
- [ ] All API endpoints tested
- [ ] Mobile responsive design verified
- [ ] SEO meta tags implemented
- [ ] Error pages (404, 500) created

### Post-launch
- [ ] Monitor error logs
- [ ] Track first 100 splits created
- [ ] Gather user feedback
- [ ] Fix critical bugs within 24h
- [ ] Optimize based on real usage data

---

## Future Enhancements (Post-MVP)

### Phase 2 Features
1. **Unequal Splits**: Custom amounts per person
2. **Edit Split**: Allow creator to modify details
3. **Payment Reminders**: Automated WhatsApp reminders (requires WhatsApp Business API)
4. **Split History**: View past splits (requires user accounts)
5. **Multiple Currencies**: Support USD, EUR, etc.
6. **Receipt Upload**: Attach bill image to split

### Phase 3 Features
1. **Payment Verification**: Integrate with UPI APIs to auto-verify payments
2. **Recurring Splits**: Monthly rent, subscriptions
3. **Group Accounts**: Create permanent groups (like Splitwise)
4. **Expense Analytics**: Charts and insights
5. **Export to CSV**: Download split data

---

## Success Criteria

### MVP Success Metrics (First 30 Days)
- **Splits Created**: 1,000+
- **Completion Rate**: >70% (splits with all participants marked paid)
- **Share Rate**: >80% (splits shared at least once)
- **Return Rate**: >35% (creators who make 2+ splits)
- **Avg. Time to Pay**: <90 seconds (from link click to marking paid)
- **Pay Button Usage**: >80% (participants using direct pay vs manual copy)
- **Mobile Usage**: >85% of traffic

### Product-Market Fit Indicators
- Organic sharing (word-of-mouth growth)
- WhatsApp groups requesting features
- Low creator dropout (<20% abandon during creation)
- High participant engagement (>70% mark as paid)

---

## Glossary

**Split**: A single shared expense created by one person  
**Creator**: The person who creates and shares the split  
**Participant**: Anyone included in the split who needs to pay  
**Mark as Paid**: Self-reporting payment completion  
**Per-person Amount**: Total amount divided equally among participants  
**UPI**: Unified Payments Interface (India's real-time payment system)  
**UPI ID**: Unique identifier for UPI payments (e.g., username@bank)

---

## Support & Contact

**For developers using this PRD:**
- Treat all "MUST-HAVE" features as mandatory for MVP
- "Optional" features can be skipped initially
- Follow tech stack recommendations unless strong reason to deviate
- Prioritize mobile experience over desktop

**Questions during implementation:**
- Ambiguous requirement? Default to simplest solution
- Technical blocker? Document and propose alternative
- Missing spec? Use best judgment for UX, prioritize user clarity

---

**END OF PRD**

*Version: 1.0*  
*Last Updated: 2026-02-09*  
*Total Pages: Comprehensive specification for agentic coding implementation*