# SKIDS SK System

SKIDS is a React + Vite frontend with an Express/MongoDB API for SK youth
information, announcements, events, budget transparency, documents, messages,
and admin activity logs.

## Stack

- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Express, MongoDB, Mongoose
- Authentication: Google Identity Services, password login, and app JWTs
- Uploads: signed browser-to-Cloudinary uploads
- Hosting: Vercel frontend and Render backend

## Local setup

Install dependencies:

```bash
npm install
```

Create a private `.env` file in the repository root:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/skids
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
ADMIN_EMAILS=officer@example.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_FOLDER=skids
CORS_ORIGINS=http://localhost:5173
```

Create a second private file named `.env.local` for Vite:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

Run the API and frontend in separate terminals:

```bash
npm run dev:server
npm run dev
```

The frontend defaults to `http://localhost:5173`; the API defaults to
`http://localhost:5000/api`.

## Account and role security

- Public password registration always creates a youth account.
- Officer/admin accounts sign in with Google using an email listed in
  `ADMIN_EMAILS`.
- The backend verifies the Google ID token before granting the admin role.
- Do not expose `JWT_SECRET`, `MONGODB_URI`, or `CLOUDINARY_API_SECRET` in the
  frontend.
- Existing password-based officer accounts can still log in, but new officer
  accounts should use Google so email ownership is verified.

Youth account flow:

```text
/user-login -> /terms -> /youth-profile-form -> /create-account -> /account-created
```

Officer account flow:

```text
/officer-login -> Continue with authorized Google account
```

## Production deployment

Use one canonical frontend origin, such as
`https://your-project.vercel.app` or a custom domain. Use this exact origin in
Vercel, Render CORS, and Google Cloud. Do not add a path or trailing slash.

Recommended deployment order:

1. Create the Vercel project and reserve its production hostname.
2. Create MongoDB Atlas and Cloudinary resources.
3. Configure Google Auth Platform and create a Web OAuth client.
4. Create the Render service and configure its environment variables.
5. Add Render's outbound IP ranges to MongoDB Atlas.
6. Verify the Render health endpoint.
7. add the Render API URL to Vercel and redeploy the frontend.
8. Run the production verification checklist at the end of this document.

### 1. MongoDB Atlas

1. Create an Atlas cluster. For users in the Philippines, placing both Atlas
   and Render in Singapore usually gives the lowest latency.
2. Create a database user with `readWrite` access to the `skids` database.
3. After creating the Render service, open **Connect > Outbound** in Render and
   copy all listed CIDR ranges.
4. Add those ranges under **Atlas > Network Access**. Avoid permanent
   `0.0.0.0/0` access.
5. Select **Connect > Drivers** and copy the `mongodb+srv://` URI.
6. Replace the password and include the database name:

```text
mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/skids?retryWrites=true&w=majority
```

Percent-encode reserved characters in the username or password.

References:

- https://render.com/docs/connect-to-mongodb-atlas
- https://www.mongodb.com/docs/atlas/driver-connection/

### 2. Cloudinary

Create a Cloudinary product environment and copy its cloud name, API key, and
API secret. No unsigned upload preset is needed. The API signs the upload
parameters and the browser uploads directly to Cloudinary.

The API secret belongs only in Render. Never create a
`VITE_CLOUDINARY_API_SECRET` variable.

Reference: https://cloudinary.com/documentation/node_image_and_video_upload

### 3. Google Cloud Console

This project only uses **Sign in with Google**. It does not call Google
Calendar, Drive, Gmail, Maps, or People APIs, so none of those APIs need to be
enabled.

1. Create or select a dedicated production Google Cloud project.
2. Open **Google Auth Platform > Branding** and configure:
   - App name: `SKIDS SK System`
   - User support email
   - Developer contact email
   - Homepage, privacy policy, and terms URLs when available
   - The custom authorized domain, if one is used
3. Open **Audience**:
   - Select **External** for ordinary Google accounts.
   - Use Testing during setup and add test users.
   - Switch to **In production** before public launch.
4. Open **Data Access** and keep only the default authentication scopes:
   `openid`, `email`, and `profile`. Do not request sensitive scopes.
5. Open **Clients > Create client > Web application**.
6. Add the exact **Authorized JavaScript origins**:

```text
http://localhost:5173
http://localhost:4173
https://your-project.vercel.app
https://your-custom-domain.example
```

7. Leave **Authorized redirect URIs** empty. The application uses Google's
   popup callback, not an OAuth redirect endpoint.
8. Copy the generated client ID into both:
   - Render: `GOOGLE_CLIENT_ID`
   - Vercel: `VITE_GOOGLE_CLIENT_ID`

The two values must be identical. A Google client secret is not used by this
application and must not be added to Vercel.

Vercel preview URLs change frequently. Google and the API CORS policy both use
exact origins, so use Google login on the stable production domain or add a
specific preview URL manually to both systems.

References:

- https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
- https://support.google.com/cloud/answer/15549945

### 4. Render backend

The repository includes `render.yaml`. In Render, choose **New > Blueprint**,
connect the repository, and apply the Blueprint. Alternatively, create a Web
Service manually with:

```text
Root directory: repository root
Runtime: Node
Build command: npm ci
Start command: npm run start:server
Health check path: /api/health
```

Configure:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/skids?retryWrites=true&w=majority
JWT_SECRET=use-at-least-32-random-characters
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
CORS_ORIGINS=https://your-project.vercel.app
CLIENT_URL=https://your-project.vercel.app
ADMIN_EMAILS=chair@example.com,secretary@example.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_FOLDER=skids
```

Important:

- Do not define `PORT`; Render provides it.
- `CORS_ORIGINS` accepts comma-separated exact origins.
- If both `CORS_ORIGINS` and `CLIENT_URL` exist, `CORS_ORIGINS` takes
  precedence.
- Environment validation intentionally prevents a production server from
  starting when a required secret or provider setting is missing.
- The health check URL is
  `https://YOUR-SERVICE.onrender.com/api/health`.

`render.yaml` currently selects Render Free. Free web services sleep after 15
minutes of inactivity and can take about a minute to wake. The frontend allows
90 seconds for this wake-up, but a paid Render instance is recommended for a
real public service.

References:

- https://render.com/docs/deploy-node-express-app
- https://render.com/docs/free

### 5. Vercel frontend

Import the same repository into Vercel. The included `vercel.json` supplies the
Vite build, SPA deep-link rewrite, and headers needed for Google popup login.

Use:

```text
Framework preset: Vite
Root directory: repository root
Build command: npm run build
Output directory: dist
```

Add these Production environment variables:

```env
VITE_API_URL=https://YOUR-SERVICE.onrender.com/api
VITE_GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

Every `VITE_*` value is public browser configuration. After changing a Vercel
environment variable, redeploy because Vite embeds it during the build.

Reference: https://vercel.com/docs/frameworks/frontend/vite

## Cloudinary upload flow

1. The frontend requests an authenticated signature from
   `POST /api/uploads/signature`.
2. The API signs a timestamp and destination folder using the Cloudinary API
   secret.
3. The browser uploads the file directly to Cloudinary.
4. The frontend stores the returned secure URL and metadata through the API.

## Production verification checklist

- `GET https://YOUR-SERVICE.onrender.com/api/health` returns `status: "ok"`.
- Directly opening and refreshing a nested Vercel route does not return 404.
- Youth password registration creates a user, never an admin.
- Officer registration by password is rejected.
- An email in `ADMIN_EMAILS` becomes admin after Google sign-in.
- A Google account outside `ADMIN_EMAILS` becomes a youth user.
- Profile photo and document uploads complete successfully.
- MongoDB data remains after a Render restart or redeploy.
- Browser requests from the production Vercel origin pass CORS.
- Requests from an unlisted origin fail CORS.
- Render logs contain no missing-environment, MongoDB, Google audience, or
  rate-limit proxy errors.

## Scripts

```bash
npm run dev          # frontend development server
npm run dev:server   # backend development server
npm run build        # production frontend build
npm run lint         # lint frontend and backend
npm run start:server # production API server
```
