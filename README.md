# Villament — Real Estate Website + Admin Panel

A full-stack website for **Villament**, a villa-community developer.

- **Frontend:** React 18 + React Router + Vite (plain CSS, no UI library)
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Admin panel:** add / edit / remove properties, see every enquiry, and track each lead (contacted or not, status, follow-up dates, notes, history), with CSV export.

---

## 1. What you need installed

| Tool | Version | Download |
| --- | --- | --- |
| Node.js | 18 or newer | https://nodejs.org |
| MongoDB | 6 or newer, **or** a free MongoDB Atlas cluster | https://www.mongodb.com/try/download/community · https://www.mongodb.com/atlas |

---

## 2. First-time setup

Open a terminal in the `villament` folder.

### Backend

```bash
cd server
npm install
cp .env.example .env        # on Windows: copy .env.example .env
```

Open `server/.env` and set at least:

- `MONGODB_URI` – your MongoDB address (local or Atlas)
- `JWT_SECRET` – any long random text
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` – the login for the admin panel

Then create the admin account and sample data:

```bash
npm run seed                # add "-- --fresh" to wipe properties & leads first
```

### Frontend

```bash
cd ../client
npm install
```

---

## 3. Running the project (development)

Use **two terminals**:

```bash
# Terminal 1 – API on http://localhost:5000
cd server
npm run dev
```

```bash
# Terminal 2 – website on http://localhost:5173
cd client
npm run dev
```

- Website: http://localhost:5173
- Admin panel: http://localhost:5173/admin (log in with ADMIN_EMAIL / ADMIN_PASSWORD)

Vite forwards `/api` and `/uploads` to the API automatically (see `client/vite.config.js`).

---

## 4. Going live (production)

```bash
cd client && npm run build          # creates client/dist
cd ../server && NODE_ENV=production npm start
```

With `NODE_ENV=production`, the Express server also serves the built React app, so one server runs everything.
If you host the API on a separate domain, set `VITE_API_URL` in `client/.env` before building
and add the website's address to `CLIENT_ORIGIN` in `server/.env`.

**Before launch, replace the placeholders** in `client/src/data/siteContent.js`
(phone, email, address, WhatsApp number, and testimonials — use real buyer quotes with permission),
and the sample projects via the admin panel.

---

## 5. Folder structure

```
villament/
├── server/                      Node.js + Express API
│   ├── server.js                Starts the API
│   ├── config/database.js       MongoDB connection
│   ├── models/                  Property, Enquiry (lead), Admin
│   ├── controllers/             The logic behind each API route
│   ├── routes/                  publicRoutes.js, adminRoutes.js
│   ├── middleware/              Login check, image upload, error handling
│   ├── seed/                    Sample data + seed script
│   └── uploads/                 Uploaded property photos (created automatically)
│
└── client/                      React website
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx              All page routes
        ├── api/apiClient.js     Every call to the API
        ├── context/             Admin login, shortlist, enquiry pop-up
        ├── components/          Header, footer, cards, forms, EMI calculator…
        ├── pages/               Home, Properties, Property detail, About, Contact
        ├── admin/               Login, Dashboard, Properties, Property form, Leads
        ├── data/siteContent.js  Editable text: company details, FAQs, testimonials
        └── styles/              global.css (website), admin.css (admin panel)
```

---

## 6. Features

### Website (for visitors)
- Home page with hero search (location, home type, status), company numbers, featured communities, brand promises, upcoming-launch call-out, testimonials and FAQs
- Communities page with search, filters and sorting — filters are kept in the address so views can be shared
- Property page with photo gallery, key facts, amenities, **EMI calculator**, map and directions, and similar properties
- **Shortlist** (heart icon) saved in the visitor's browser — no account needed
- Enquiry forms everywhere: Book a Site Visit (with preferred date), Get Brochure, Register Interest, General
- Floating WhatsApp button and a mobile Call / Book bar
- Spam protection with a hidden "honeypot" field

### Admin panel
- Secure login (bcrypt-hashed passwords, JWT tokens)
- **Dashboard:** leads not yet contacted, leads this week, conversion rate, lead pipeline, follow-ups due, latest enquiries, most-enquired properties
- **Properties:** add, edit, delete; upload photos or paste image links; choose the cover photo; mark as featured
- **Leads (user records):**
  - Tabs: All · Not contacted · Contacted · Site Visit Scheduled · Converted · Not Interested
  - Search and filter by type, property and date
  - Change status straight from the table; uncontacted leads are highlighted
  - Lead drawer: one-tap call / WhatsApp / email, **Mark as contacted**, next follow-up date, notes, full history of who did what and when
  - **Export to CSV** (opens in Excel / Google Sheets)

---

## 7. API reference

| Method | Address | Login | Purpose |
| --- | --- | --- | --- |
| GET | /api/properties | – | List properties (`status`, `type`, `city`, `search`, `featured`, `sort`, `limit`) |
| GET | /api/properties/filters | – | Cities, types, statuses for drop-downs |
| GET | /api/properties/:slug | – | One property + similar ones |
| POST | /api/enquiries | – | Submit an enquiry |
| POST | /api/auth/login | – | Admin login → token |
| GET | /api/admin/dashboard | ✔ | Dashboard numbers |
| GET/POST | /api/admin/properties | ✔ | List / create properties |
| GET/PUT/DELETE | /api/admin/properties/:id | ✔ | Read / update / delete a property |
| GET | /api/admin/enquiries | ✔ | List leads (`leadStatus`, `contacted`, `enquiryType`, `propertyId`, `search`, `fromDate`, `toDate`, `page`) |
| GET | /api/admin/enquiries/export | ✔ | Download leads as CSV |
| GET/PATCH/DELETE | /api/admin/enquiries/:id | ✔ | Read / update status & follow-up / delete a lead |
| POST | /api/admin/enquiries/:id/notes | ✔ | Add a follow-up note |

Admin routes need the header `Authorization: Bearer <token>`.
