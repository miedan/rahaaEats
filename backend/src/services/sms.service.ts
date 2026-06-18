import { ENV } from '../config/env';

export async function sendOtpSms(phoneNumber: string, otp: string): Promise<void> {
  if (ENV.NODE_ENV === 'development' && !ENV.AT_API_KEY) {
    console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`);
    return;
  }

  const response = await fetch('https://api.africastalking.com/version1/messaging', {
    method: 'POST',
    headers: {
      apiKey: ENV.AT_API_KEY,
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      username: ENV.AT_USERNAME,
      to: phoneNumber,
      message: `Your Rahaa verification code is: ${otp}. Expires in 5 minutes. Do not share this code.`,
      from: ENV.AT_SENDER_ID || '',
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`SMS send failed: ${response.statusText}`);
  }
}
