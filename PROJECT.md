# Aryan Trophy World – Trophy Catalog CMS

## Overview
Production-ready, inquiry-based trophy catalog CMS. Two apps: Public catalog website + Admin CMS dashboard. NOT ecommerce. Inquiry-only.

## Business Rules
- One Product = One Trophy/Medal/Pin (single item, no variants)
- No inventory, no cart, no checkout, no orders, no customer accounts
- Single admin (business owner) — NO signup, only login
- Customers browse catalog and submit inquiries (can include multiple products)
- Business replies via phone/email manually
- Everything editable via CMS: site name, logo, contact info, social links, owner details
- Logo and branding uploaded by client later via admin settings

## Product Structure
Each product has:
- ONE category (Sports, Academic, Corporate)
- ONE subcategory (Football, Cricket — affiliated to its category)
- ONE type (Trophy, Pin, Medal, Badge, Plaque)
- MULTIPLE materials via junction table (Metal, Wood, Crystal)
- MULTIPLE themes via junction table (Sports, Religious, Corporate)
- MULTIPLE shapes via junction table (Cup, Shield, Star)
- MULTIPLE collection tags via junction table (or none)
- Size unit selectable per product (cm, inch, mm, feet)
- Image gallery with one primary image
- 2D Pricing Matrix: rows = Size(LxBxH) + Weight, columns = Quantity breakpoints, cells = ₹ per piece
- SEO fields, customization options, specifications
- Soft delete support

## Inquiry System
- User can inquire about MULTIPLE products in one inquiry
- Each product in inquiry has its own quantity
- Fields: Name, Company, Email, Phone, City, Message
- Status: New → Read → Replied → Closed
- Admin sees all inquiries with linked products

## Admin Profile
- Separate from login (Supabase Auth handles login)
- admin_profile table: name, email (display), phone, business_name, address, city, state, pincode, avatar, bio
- Used on public site for contact details

## Tech Stack
Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Drizzle ORM, PostgreSQL (Supabase), Supabase Auth, Supabase Storage, Zod, React Hook Form, Sharp, Zustand, TanStack Table

## Database
20 tables. See implementation plan for full ER diagram.

## Folder Structure
src/app/(public)/ — public pages
src/app/(admin)/admin/ — admin CMS pages
src/app/api/v1/ — API routes
src/components/ — ui, public, admin, shared
src/db/ — schema, migrations, seed
src/lib/ — supabase, validations, utils, constants
src/hooks/ — custom hooks
src/stores/ — zustand
src/types/ — typescript types
