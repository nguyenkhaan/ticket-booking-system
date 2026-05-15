# Project Backend scope: 

## 1. Bussiness Context  

A startup is preparing to launch an online Concert Ticket Booking Platform.

The platform allows users to:

- Browse concerts
- View ticket categories and prices
- Reserve tickets
- Apply promotional vouchers
- Track booking status

To support daily operations, the startup also needs an internal Operation Dashboard for operators and
administrators.
The Operation Dashboard helps the operation team:

- Monitor bookings
- Manage / publish new concerts’ tickets
- Validate ticket availability
- Manage voucher campaigns
- Handle failed or suspicious bookings
- Update booking status manually when necessary

## 2. Bussiness Expectation 


Expected traffic:
- Around 50,000 users 
- Peak traffic around 300  -500 req per minute 

Each concert event has: 
- Limited ticket quantity 
- Multiple ticket categories 
- Limited promotional voucher 

The startup is concern about: 
- Overselling ticket 
- Duplicate bookings caused by retries
- Users abusing promotional vouchers
- System instability during flash sale traffic peak 

## 3. Requirements 
Your job is:
- Design an architecture for this Concert Ticket Booking Platform.
- Setup & implement the codebase that reflects the architecture
-
Provide Backend APIs for both:
- Internal operation workflows 
- Customer-facing booking flows
