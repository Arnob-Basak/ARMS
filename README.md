<div align="center">

# 🎓 ARMS — Campus Resource Hub

### A student-to-student academic resource sharing platform for the BAUET community

🌐 **Live Website:** [https://arms-arnob.netlify.app/](https://arms-arnob.netlify.app/)

</div>

---

## 📖 About the Project

**ARMS (Academic Resource Management System)** is a web-based campus resource sharing platform designed for students of **Bangladesh Army University of Engineering & Technology (BAUET)**.

The goal of ARMS is simple: make it easier for students to **find, share, reuse, and exchange academic resources** within the campus community.

Students can browse resources such as lecture notes, textbooks, lab equipment, previous question papers, and assignments. Registered users can also publish their own listings and manage the resources they have shared.

---

## ✨ Main Features

- 🔎 Search academic resources by title, category, or description
- 🗂️ Browse resources by category
- 📚 Notes, Books, Lab Equipment, Question Papers, and Assignments
- ↕️ Sort listings by newest or price
- 👤 User registration and login
- ➕ Post new resource advertisements
- 🖼️ Upload an optional resource image
- 💰 Add a price to a listing
- 📝 Add an optional description without a minimum character requirement
- 👤 View your profile and your published ads
- 🗑️ Delete your own advertisements
- 🌗 Light and Dark mode
- 📱 Responsive design for desktop, tablet, and mobile
- 🔐 Firebase Authentication
- ☁️ Firebase Firestore database
- 🖼️ Firebase Storage for uploaded images

---

## 🧭 How ARMS Works

### 1. Discover Resources

Anyone can visit ARMS and browse the available academic resources. Users can use the search bar, category filters, and sorting options to quickly find what they need.

### 2. Create an Account

To publish a resource, a user creates an account using:

- Full Name
- Department
- Student ID
- Email Address
- Password

Firebase Authentication is used to handle user accounts and login sessions.

### 3. Post a Resource

After signing in, a user can open the **Post an Ad** page and provide:

- Advertisement title
- Resource category
- Price
- Description *(optional)*
- Resource photo *(optional)*

The listing is then stored in Firebase Firestore. Uploaded photos are stored using Firebase Storage.

### 4. Browse & Contact

Published resources appear on the Browse Resources page. Other students can view the listing information and use the provided contact email to communicate with the owner.

### 5. Manage Your Ads

Signed-in users can open their profile to see the resources they have posted and delete their own listings when they are no longer available.

---

## 🗂️ Resource Categories

ARMS currently supports these categories:

| Category | Purpose |
| --- | --- |
| 📝 Notes | Lecture notes, summaries, and study materials |
| 📚 Books | Textbooks and reference books |
| 🧪 Lab Equipment | Tools and equipment used for practical work |
| 📄 Question Papers | Previous examination and practice papers |
| ✅ Assignments | Assignment examples and study references |

---

## 🛠️ Technologies Used

| Technology | Usage |
| --- | --- |
| HTML5 | Website structure |
| CSS3 | Styling, responsive layout, light/dark themes |
| JavaScript (ES Modules) | Frontend functionality and interaction |
| Firebase Authentication | User registration and login |
| Firebase Firestore | Resource and user data storage |
| Firebase Storage | Resource image uploads |
| Netlify | Website hosting and deployment |

---

## 📁 Project Structure

```text
ARMS/
│
├── index.html                  # Home page
├── ads.html                    # Browse and search resources
├── post-ad.html                # Create a new resource listing
├── login.html                  # User login page
├── register.html               # User registration page
│
├── style.css                   # Shared website styles
├── theme.js                    # Light/Dark theme handling
├── ui.js                       # Common UI functionality
├── data.js                     # Resource data loading
├── firebase.js                 # Firebase configuration
├── auth-forms.js               # Login and registration logic
├── ads-display.js              # Search, filter and sorting logic
├── nav-auth-menu.js            # Authentication-aware navigation/profile
├── post-ad.ui.firebase.js      # Resource posting and image upload logic
│
├── icons.svg                   # Website SVG icons
├── arms.png                    # ARMS logo
└── fonts/                      # Local font files and licenses
```

---

## 🚀 Run the Project Locally

This project is a **static frontend website**, so there is no npm installation or build process required.

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Arnob-Basak/ARMS.git
```

### Step 2 — Enter the Project Folder

```bash
cd ARMS
```

### Step 3 — Start a Local Server

If Python is installed:

```bash
python -m http.server 8000
```

On some Windows systems, use:

```bash
py -m http.server 8000
```

### Step 4 — Open the Website

Visit:

```text
http://localhost:8000
```

> **Note:** It is recommended to run the project through a local HTTP server instead of opening `index.html` directly with `file://`, because the project uses JavaScript modules and Firebase services.

---

## 🔥 Firebase Integration

ARMS uses **Firebase SDK 9.23.0** and connects to Firebase through `firebase.js`.

The project currently uses:

- **Firebase Authentication** — account creation and login
- **Cloud Firestore** — users and resource listings
- **Firebase Storage** — uploaded resource images

Resource listings are stored in the `ads` collection and contain data such as:

```text
title
category
description
price
userId
email
displayName
timestamp
status
image
```

Uploaded resource images use the `ads/` storage path.

> Firebase web configuration is included in the frontend. Access to database records, authentication actions, and storage should be protected using properly configured Firebase Security Rules.

---

## 🖼️ Image Upload Rules

Supported image formats:

- JPG / JPEG
- PNG
- WebP

Maximum image size:

```text
3 MB
```

Uploading an image is optional when creating a resource listing.

---

## 🌗 Theme Support

ARMS includes both **Light Mode** and **Dark Mode**.

The website initially follows the user's device theme where possible. When a user manually changes the theme, their selected preference is saved in the browser so it can be reused across pages and reloads.

---

## 📱 Responsive Design

The interface is designed to work across:

- 💻 Desktop computers
- 💻 Laptops
- 📱 Tablets
- 📱 Mobile phones

The layout, navigation, forms, cards, and resource grids automatically adapt to different screen sizes.

---

## 🌐 Deployment

The project is currently deployed using **Netlify**.

🔗 **Live Site:** [https://arms-arnob.netlify.app/](https://arms-arnob.netlify.app/)

Because ARMS is a static website, it can also be deployed on services such as:

- GitHub Pages
- Vercel
- Cloudflare Pages
- Firebase Hosting

For deployment, make sure the complete project folder is published so that the HTML files, JavaScript files, CSS, fonts, icons, and images remain together.

---

## 🎯 Project Goal

ARMS was created to build a simple campus ecosystem where useful academic materials do not go to waste.

Instead of every student searching independently for the same books, notes, question papers, or equipment, ARMS allows students to share those resources with others and make learning more accessible within the university community.

> **Learn · Share · Grow** 🌱

---

## 👨‍💻 Development

This project is built using frontend web technologies with Firebase as its backend service.

Contributions, improvements, bug fixes, and new feature ideas can be added through GitHub using branches and pull requests.

---

<div align="center">

### 🎓 Made for the BAUET Community

**ARMS — A little sharing. A lot of possibility.**



</div>
