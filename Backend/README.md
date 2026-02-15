# RentEase Backend

## MongoDB Atlas setup

1. **Create an account** at [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign in.

2. **Create a free cluster** (M0) and choose a region close to you.

3. **Create a database user**  
   Security → Database Access → Add New Database User  
   - Choose “Password” and set a username/password (save them).  
   - Role: “Atlas admin” or “Read and write to any database”.

4. **Allow network access**  
   Security → Network Access → Add IP Address  
   - For development: “Allow Access from Anywhere” (`0.0.0.0/0`).  
   - For production: add only your server IP.

5. **Get your connection string**  
   Database → Connect → “Connect your application”  
   - Copy the URI. It looks like:  
     `mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/`

6. **Set in `.env`**  
   Copy `.env.example` to `.env` (if needed) and set:
   ```env
   MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/rentease?retryWrites=true&w=majority
   ```
   Replace `YOUR_USER`, `YOUR_PASSWORD`, and `YOUR_CLUSTER` with your Atlas database user and cluster host.  
   If your password has special characters (e.g. `#`, `@`), URL-encode them (e.g. `#` → `%23`).

7. **Run the server**
   ```bash
   npm run dev
   ```
   You should see “Connected to MongoDB” and “Server running on port 5000”.
