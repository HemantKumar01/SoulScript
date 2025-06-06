from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
import json
import sys
from lxml.html.diff import htmldiff
from os import environ as env
import smtplib
from dotenv import load_dotenv
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os

load_dotenv()


def sendEmail(Name, To, subject, message):

    # creates SMTP session
    s = smtplib.SMTP("smtp.gmail.com", 587)

    # start TLS for security
    s.starttls()

    email = env["EMAIL"]
    password = env["PASSWORD"]

    # Authentication
    s.login(email, password)

    # sending the mail
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = Name
    msg["To"] = To

    text = message.replace("<br>", "\n")

    part1 = MIMEText(text, "plain")
    part2 = MIMEText(message, "html")

    msg.attach(part1)
    msg.attach(part2)

    s.sendmail(Name, To, msg.as_string())
    # terminating the session
    s.quit()


sendEmail(
    "SoulScript System",
    "ytbhemant@gmail.com",
    "Test Email",
    "<h1>Test Email</h1><p>This is a test email sent from the SoulScript system.</p>",
)
