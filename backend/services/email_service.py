"""
Email Notification Service - Sends transactional emails via Resend.
"""
import resend
from config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Resend
resend.api_key = settings.RESEND_API_KEY

# Email Templates
TEMPLATES = {
    "welcome": {
        "subject": "Welcome to Designika! 🎨",
        "html": """
        <h1>Welcome to Designika!</h1>
        <p>Hi {name},</p>
        <p>Thanks for joining Designika - your AI-powered interior design assistant!</p>
        <p>You've been gifted <strong>5 FREE credits</strong> to get started.</p>
        <p>Start designing: <a href="https://designika.ai/dashboard">Go to Dashboard</a></p>
        <br>
        <p>Happy designing! 🏠</p>
        <p>– The Designika Team</p>
        """
    },
    "design_complete": {
        "subject": "Your Design is Ready! ✨",
        "html": """
        <h1>Your Design is Complete!</h1>
        <p>Hi {name},</p>
        <p>Great news! Your interior design for <strong>{room_type}</strong> in <strong>{style}</strong> style is ready.</p>
        <p><a href="{design_url}">View Your Design</a></p>
        <br>
        <p>Credits remaining: {credits}</p>
        <p>– The Designika Team</p>
        """
    },
    "payment_success": {
        "subject": "Payment Received - Credits Added! 💳",
        "html": """
        <h1>Thank You for Your Purchase!</h1>
        <p>Hi {name},</p>
        <p>We've received your payment and added <strong>{credits} credits</strong> to your account.</p>
        <p>New balance: <strong>{balance} credits</strong></p>
        <p><a href="https://designika.ai/dashboard">Start Designing</a></p>
        <br>
        <p>– The Designika Team</p>
        """
    },
    "low_credits": {
        "subject": "Running Low on Credits ⚠️",
        "html": """
        <h1>Low Credit Balance</h1>
        <p>Hi {name},</p>
        <p>You have only <strong>{credits} credits</strong> remaining.</p>
        <p><a href="https://designika.ai/pricing">Top Up Now</a></p>
        <br>
        <p>– The Designika Team</p>
        """
    }
}


class EmailService:
    @staticmethod
    def send_email(to: str, template: str, data: dict = None) -> bool:
        """Send an email using a predefined template."""
        if not settings.RESEND_API_KEY:
            logger.warning("Resend API key not configured, skipping email")
            return False
        
        template_data = TEMPLATES.get(template)
        if not template_data:
            logger.error(f"Unknown email template: {template}")
            return False
        
        try:
            # Format the template with data
            data = data or {}
            html = template_data["html"].format(**data)
            subject = template_data["subject"]
            
            response = resend.Emails.send({
                "from": "Designika <noreply@designika.ai>",
                "to": [to],
                "subject": subject,
                "html": html
            })
            
            logger.info(f"Email sent to {to}: {template}")
            return True
        
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False
    
    @staticmethod
    def send_welcome(email: str, name: str):
        """Send welcome email with free credits info."""
        return EmailService.send_email(email, "welcome", {"name": name})
    
    @staticmethod
    def send_design_complete(email: str, name: str, room_type: str, style: str, design_url: str, credits: int):
        """Send notification when design generation is complete."""
        return EmailService.send_email(email, "design_complete", {
            "name": name,
            "room_type": room_type,
            "style": style,
            "design_url": design_url,
            "credits": credits
        })
    
    @staticmethod
    def send_payment_success(email: str, name: str, credits: int, balance: int):
        """Send payment confirmation."""
        return EmailService.send_email(email, "payment_success", {
            "name": name,
            "credits": credits,
            "balance": balance
        })
    
    @staticmethod
    def send_low_credits(email: str, name: str, credits: int):
        """Send low credit warning."""
        return EmailService.send_email(email, "low_credits", {
            "name": name,
            "credits": credits
        })


# Export singleton
email_service = EmailService()
