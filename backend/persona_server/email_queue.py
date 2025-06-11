import asyncio
from typing import Dict, Any
from mail import sendEmail
import os

class EmailQueue:
    def __init__(self):
        self.queue = asyncio.Queue()
        self.worker_task = None

    async def start(self):
        """Start the email queue worker"""
        self.worker_task = asyncio.create_task(self._process_queue())

    async def stop(self):
        """Stop the email queue worker"""
        if self.worker_task:
            self.worker_task.cancel()
            try:
                await self.worker_task
            except asyncio.CancelledError:
                pass

    async def add_email(self, email_data: Dict[str, Any]):
        """Add an email to the queue"""
        await self.queue.put(email_data)

    async def _process_queue(self):
        """Process emails in the queue"""
        while True:
            try:
                email_data = await self.queue.get()
                try:
                    sendEmail(
                        Name=email_data["Name"],
                        To=email_data["To"],
                        subject=email_data["subject"],
                        message=email_data["message"],
                        attachment_path=email_data.get("attachment_path")
                    )
                    
                    # Clean up attachment if it exists
                    if email_data.get("attachment_path") and os.path.exists(email_data["attachment_path"]):
                        os.remove(email_data["attachment_path"])
                        
                except Exception as e:
                    print(f"Error sending email: {str(e)}")
                finally:
                    self.queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"Error processing email queue: {str(e)}")
                await asyncio.sleep(1)  # Prevent tight loop on errors

# Create a global instance of the email queue
email_queue = EmailQueue() 