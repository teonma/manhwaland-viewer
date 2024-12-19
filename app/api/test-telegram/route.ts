import { NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/utils/telegram-bot'

export async function GET() {
  try {
    await sendTelegramMessage('<b>Test Message</b>\nTelegram bot integration is working!')
    return NextResponse.json({ success: true, message: 'Test message sent successfully' })
  } catch (error) {
    console.error('Error sending test message:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

