# RentEase API (Simple Version)

## Express Auth (JWT)

- **POST /api/auth/register**  
  Body: `{ name, email, password, role }` (role: `tenant` \| `landlord`)  
  → Creates user (password hashed with bcrypt), returns `{ token, user }`.

- **POST /api/auth/login**  
  Body: `{ email, password }`  
  → Returns `{ token, user }` (user: id, name, email, role). Use `Authorization: Bearer <token>` for protected routes.

- **Protected routes**
  - `/api/tenant/*` — requires valid JWT and role `tenant`.
  - `/api/landlord/*` — requires valid JWT and role `landlord`.

## Auth (Legacy / Firebase)
POST /auth/token-verify  
→ Verify Firebase token and return user details

## Users
GET /users/me  
→ Get logged-in user info

## Properties
GET /properties  
→ List properties
POST /properties  
→ Add property

## Tenancies
POST /tenancies  
→ Create tenancy
GET /tenancies/:id  
→ Get tenancy details

## Payments (Razorpay)
POST /payments/create-order  
→ Create Razorpay order
POST /payments/verify  
→ Verify payment signature

## Maintenance Tickets
POST /tickets  
→ Create a ticket
GET /tickets?tenancy_id=X  
→ List tickets for tenancy

## Uploads (Cloudinary)
POST /upload  
→ Upload image/PDF and return URL
