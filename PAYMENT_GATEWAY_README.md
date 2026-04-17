# Payment Gateway Integration

This project now includes Stripe payment gateway integration for course enrollments.

## Setup Instructions

### 1. Get Stripe API Keys
1. Sign up for a Stripe account at https://stripe.com
2. Go to the Stripe Dashboard
3. Navigate to Developers > API Keys
4. Copy your **Publishable key** (starts with `pk_test_` for test mode)

### 2. Configure the Payment Gateway
1. Open `course.html`
2. Find this line in the JavaScript:
   ```javascript
   const stripe = Stripe('pk_test_your_publishable_key_here');
   ```
3. Replace `'pk_test_your_publishable_key_here'` with your actual Stripe publishable key

### 3. Backend Setup (Required for Production)
For a complete payment solution, you'll need a backend server to:
- Create PaymentIntents
- Handle webhooks for payment confirmation
- Process refunds
- Store payment data securely

The current implementation simulates payments for demonstration purposes.

## How It Works

1. User logs in and opens a course enrollment modal
2. User submits the booking request first
3. Booking is saved with `pending_payment` status
4. User is shown a payment prompt for the course fee
5. After payment, enrollment status becomes `paid`
6. User is redirected to the dashboard with confirmed course booking

## Features

- Secure card input using Stripe Elements
- Real-time validation
- Payment status tracking
- Integration with existing booking system
- Responsive design

## Testing

To test the payment gateway:
1. Start the local server: `python -m http.server 8000`
2. Open http://localhost:8000/course.html
3. Log in first, then select a course and submit the booking request
4. Complete the payment on the next screen to confirm enrollment
5. If you choose "Pay Later", the booking remains pending until payment is done
6. Use Stripe test card numbers for testing (see Stripe docs)

## Security Notes

- Never expose secret keys in client-side code
- Always use HTTPS in production
- Implement proper error handling
- Validate payments on the server side