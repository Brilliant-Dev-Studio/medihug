
Where Developers Build for Developers
SMSPoh RESTful API Specification Version 3.0
API Overview

This document describes the full functionalities and detailed documentation of the SMSPoh API V3. It is intended for organizations and individuals who need to send or receive SMS messages programmatically.
Version

The last version of SMSPoh API V3.0 enhanced performance, streamlined endpoints, and improved security features. With simplified authentication and more consistent responses, it aims to provide a smoother, more reliable experience for developers.
Base URL

The base URL for this service is https://v3.smspoh.com/api/rest. This base URL cannot be used independently;
you must append a specific path that identifies the desired operation, and you may need to specify certain path parameters.
https://v3.smspoh.com/api/rest
Authentication

Please note that the previous SMSPoh API credentials are no longer compatible with API V3.

To create a new API credential, please navigate to the https://v3.smspoh.com/ and Accounts & Security > API Credentials page in the customer dashboard.
The SMSPoh RESTful API supports two authorization methods: Bearer Auth and Basic Auth.
1. Bearer Token Authentication


You must combine the API key and API secret using a colon (:) in the format APIKey:APISecret and then encode this string using Base64 encoding to obtain the API Token.
Base64Encode:
base64encode(SMSPohV3APIKey:SMSPohV3APISecret)
Auth Header:
Authorization: Bearer U01TUG9oVjNBUElLZXk6U01TUG9oVjNBUElTZWNyZXQ=
2. Basic Authentication
Username: SMSPohV3APIKey
Password: SMSPohV3APISecret

Auth Header:
Authorization: Basic U01TUG9oVjNBUElLZXk6U01TUG9oVjNBUElTZWNyZXQ=
Content Type

All requests to the API must specify the content type in the headers. The supported content type is JSON.
Content-Type: application/json
API Security Practices
IP Whitelist

In order to improve the security of the API interface, you may create a whitelist of IP addresses. Sending messages will be possible only from the whitelisted IP addresses (attempts at sending messages from other IPs will result will response HTTP 401 Unauthorized Error).
Encrypt Message

The SMSPoh API V3.0 enables you to encrypt your text messages, which our system will then decrypt before sending them to the mobile network operator. Our system encrypts and securely stores the encrypted messages in our database. Encrypt the whole message content is ensuring that even if data is compromised, it remains unreadable without the encryption key. This solution is ideal for corporations, banks, and government agencies, providing complete privacy and security. The message encryption using PBKDF2 and a random salt function.
Send Message
Send URL

This API allows you to send one or more recipient.
https://v3.smspoh.com/api/rest/send POST
Payload

{
  "to": "09*******",
  "message": "Hello World",
  "from": "SMSPoh",
  "clientReference": "abcde12345"
}

Name 	Type 	Description
to 	String Required 	Recipient mobile numbers. The mobile number can start with (09, 959 or +959) prefixes.
message 	String Required 	The message text to be sent.
from 	String Required 	The Sender ID (alphanumeric or numeric, depending on your account settings). Please note that the Sender ID is case-sensitive.
scheduledAt 	String 	MySQL Date time. Schedule your message to send later at a specific time.
encrypt 	Boolean 	To encrypt the message content. We encrypt your message content using the BKDF2 algorithm in the database.
unicode 	Boolean 	Send force as the unicode message.
test 	Boolean 	Send a test message.
deliveryReceiptUrl 	String 	Define custom delivery receipt URL for this transaction.
clientReference 	String 	Your reference value for this transaction.
International SMS

This API enables to send international mobile numbers. Please note that pricing may vary by country; you can check the most updated rates on the consumer dashboard. The charges will be deducted from your account balance accordingly. A Sender ID is required for pre-registration in certain countries. Additionally, the recipient's number must be in E.164 format. https://en.wikipedia.org/wiki/E.164

{
  "to": "+669******",
  "message": "Hello Thailand",
  "from": "SMSPoh",
  "clientReference": "abcde12345"
}

Response Body
Success:
Status: 201 OK Content-type: application/json

{
  "messages": [
    {
      "messageId": "F5BR4DB-44A1C-446C-8R69-J50248VB9ORE",
      "message": "Hello World",
      "to": "959*******",
      "clientReference": "abcde12345",
      "scheduledAt": null,
      "createdAt": "2024-12-20 12:09:48",
      "messageCount": 1,
      "from": "SMSPoh",
      "network": "MPT",
      "type": "sms.text",
      "status": "Accepted",
      "test": false
    }
  ]
}

Error:
Status: 401 Unauthorized Content-type: application/json

{
  "name": "Unauthorized",
  "message": "Your request was made with invalid credentials.",
  "code": 0,
  "status": 401
}

Send Encrypt Message

We strongly recommend using this encrypted message API for corporates, banks, e-wallets, OTPs, and all other financial transactions.
Send URL

This API allows you to send one or more recipient.
https://v3.smspoh.com/api/rest/send POST
Payload

{
  "to": "09*******",
  "message": "Your Bank OTP Code is 12345",
  "from": "SMSPoh",
  "clientReference": "abcde12345",
  "encrypt": 1,
  "encryptKey": "YourEncryptKey"
}

Response Body

Please note that if you do not specify the encryptKey in your request, a random key will be generated and included in the response body. The encryptKey must be obtained, as it will only be provided once in the response body when sending the API interface. If you do not have the encryptKey, you will not be able to decrypt your message content.
Status: 201 OK Content-type: application/json

{
  "messages": [
    {
      "messageId": "133FF6AC-6EDB-4024-8965-F5DA5FEC7F80",
      "message": "SIVvhQHJ/E1nmcDCaVmM3jBhMzZiNWYxZjU2NDI2NmM5NThhZDFjrQwZDk0YzkyYzg4NzdlOtDVlNjUxZmU4YjM0N2MzODYwZjI2NzYzM2Wiye8tFCN9RiGFcmZccQ24+vKiEUlTzRGkTBZBPJnFgVg==",
      "to": "959*******",
      "clientReference": "abcde12345",
      "scheduledAt": null,
      "createdAt": "2025-01-20 15:15:48",
      "messageCount": 1,
      "from": "SMSPoh",
      "network": "Unknown",
      "type": "sms.text",
      "status": "Accepted",
      "test": false,
      "encryptMessage": true,
      "encryptKey": "YourEncryptKey"
    }
  ]
}

Send Bulk Message
Send URL

This API allows you to send many recipients with different message content.
https://v3.smspoh.com/api/rest/send/bulk POST
Payload

{
    "messages" : [
        {
            "to" : ["09*******", "09*******","],
            "message": "Message Text",
            "from": "SMSPoh"
        },
        {
            "to" : "09*******",",
            "message": "Another Content",
            "from": "SMSPoh"
        }
    ]
}

Response Body
Success:
Status: 201 OK Content-type: application/json

{
  "messages": [
    {
      "messageId": "327DABCC-E4A9-400E-A367-EF88E51F8E7E",
      "message": "Message Text",
      "to": "959*******",
      "clientReference": "",
      "scheduledAt": null,
      "createdAt": "2025-01-20 15:01:17",
      "messageCount": 1,
      "from": "SMSPoh",
      "network": "MPT",
      "type": "sms.text",
      "status": "Accepted",
      "test": false
    },
    {
      "messageId": "EE2AF205-78D5-4111-BE5B-EF7890E12E6E",
      "message": "Message Text",
      "to": "959*******",
      "clientReference": "",
      "scheduledAt": null,
      "createdAt": "2025-01-20 15:01:17",
      "messageCount": 1,
      "from": "SMSPoh",
      "network": "Telenor",
      "type": "sms.text",
      "status": "Accepted",
      "test": false
    },
    {
      "messageId": "50558214-4644-E917-8310-379DF0E47CD7",
      "message": "Another Content",
      "to": "959*******",
      "clientReference": "",
      "scheduledAt": null,
      "createdAt": "2025-01-20 15:01:17",
      "messageCount": 1,
      "from": "SMSPoh",
      "network": "Ooredoo",
      "type": "sms.text",
      "status": "Accepted",
      "test": false
    }
  ]
}

Error:
Status: 401 Unauthorized Content-type: application/json

                        {
  "name": "Unauthorized",
  "message": "Your request was made with invalid credentials.",
  "code": 0,
  "status": 401
}

Delivery Report
Webhook

You can set a default callback URL to receive all API delivery receipts to a common URL. You can update the default delivery receipt URL at Account & Security > Settings page.
For Example:

If you use your delivery receipt webhook URL (https://yourwebsite.com/webhook/smspoh-v3-delivery-receipt), the following POST fields will be submitted.
https://yourwebsite.com/webhook/smspoh-v3-delivery-receipt?messageId=133FF6AC-6EDB-4024-8965-F5DA5FEC7F80&to=959******&clientReference=abcde12345&status=Success&updatedAt=2024-12-23 00:00:00&finishedAt=updatedAt=2024-12-23 00:02:00 POST
Post Field 	Value
messageId 	A unique SMSPoh Message UUID.
to 	Mobile number.
clientReference 	Your reference value that is associated with your API message.
status 	

    Accepted (The message has been submitted to SMSPoh)
    Sent (The message has been submitted to the network)
    Delivered (The message has been successfully delivered to subscriber handset)
    Pending (The message has been submitted to the network operator and is waiting for delivery)
    Rejected (The message has been rejected)
    Failed (The message was not able to deliver to the subscriber)
    Undelivered (The message was not able to deliver to the subscriber)
    Error (An error code was received from the network operator, and the message could not be sent.)
    Expired (The message has been expired)
    ? (Unknown Status)

updatedAt 	The MySQL date time of the new message status update (GMT +6:30).
finishedAt 	The finished MySQL date time of the message delivery.
Messages
Message History

This API allows you to retrieve previous messages that were sent through the API interface.
https://v3.smspoh.com/api/rest/messages GET
Query Parameter 	Description 	Value
limit 	The messages count to return in the API response. 	Integer (Default to 20). You can set the limits to 20, 50, 100, 500, 1000.
page 	The page number 	Integer (optional)
filterByCreatedDateFrom 	Filter by from date 	The MySQL Date Format 2024-12-01
filterByCreatedDateTo 	Filter by to date 	The MySQL Date Format 2024-12-31
from 	Filter by Sender ID 	string (optional)
to 	Filter by phone number 	integer (The mobile number must start with 95 prefix)
message 	The message text to be filtered 	string (optional)
Response
Status: 201 OK Content-type: application/json

{
  "messages": [
        {
          "messageId": "5CF5EF38-4A1C-446C-8169-7FF202ABB883",
          "message": "This is a test message.",
          "to": "959*********",
          "clientReference": "",
          "scheduledAt": null,
          "createdAt": "2025-01-20 12:09:48",
          "messageCount": 1,
          "from": "SMSPoh",
          "network": "MPT",
          "type": "sms.text",
          "status": "Success",
          "test": false,
          "finishedAt": "2025-01-20 12:36:26"
        },
        {
          "messageId": "5CF5EF38-219D-434F-B7E9-C6A40575D9C7",
          "message": "This is a test message.",
          "to": "959*********",
          "clientReference": "",
          "scheduledAt": null,
          "createdAt": "2025-01-20 12:09:29",
          "messageCount": 1,
          "from": "SMSPoh",
          "network": "Telenor",
          "type": "sms.text",
          "status": "Sent",
          "test": false,
          "finishedAt": null
        },
     ],
  "links": {
    "self": "https://v3.smspoh.com/api/rest/messages/index?page=1",
    "first": "https://v3.smspoh.com/api/rest/messages/index?page=1",
    "last": "https://v3.smspoh.com/api/rest/messages/index?page=8",
    "next": "https://v3.smspoh.com/api/rest/messages/index?page=2"
  },
  "limit": 20,
  "records": 152,
  "start": 0
}

Balance
Get Account Balance

This API provides access to your balance summary.
https://v3.smspoh.com/api/rest/account/get-balance GET
Response
Status: 201 OK Content-type: application/json

{
  "balance": 1227748,
  "currency": "MMK"
}

