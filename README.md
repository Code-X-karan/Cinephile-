# 🎬 TMDB Movie Explorer

A minimal movie web application that fetches real-time movie data from the TMDB API.
Users can browse trending movies, watch trailers, and view cast information in a clean and responsive interface.

---

## 🚀 Features

* Trending movies from TMDB
* Responsive movie grid layout
* Movie poster, title, and rating display
* Trailer playback inside modal
* Cast information for each movie
* Minimal dark UI design
* Responsive layout for mobile, tablet, and desktop

---

## 🛠 Tech Stack

* HTML
* CSS
* JavaScript
* Fetch API
* TMDB API

---

## 📂 Project Structure

```
tmdb-movie-explorer
│
├── index.html
├── style.css
└── script.js
```

---

# ⚙️ Setup Guide



# 🔑 Getting a TMDB API Key

Follow these steps to get your API key.

### Step 1 — Create an Account

Go to:

https://www.themoviedb.org

Sign up and create a free account.

---

### Step 2 — Generate API Key

1. Open **Profile Settings**
2. Go to **API**
3. Click **Create API Key**
4. Choose **Developer**
5. Fill the required details

After approval you will receive an **API Key**.

Example:

```
123abc456xyz
```

---

# 🔗 Adding the API Key to the Project

Open **script.js** and add your API key.

Example:

javascript
const API_KEY = "your_tmdb_api_key";

Example request:



Replace `"your_tmdb_api_key"` with your actual key.

---

# ▶️ Running the Project

Run a local development server.

 VS Code Live Server

1. Install **Live Server extension**
2. Right-click `index.html`
3. Click **Open with Live Server**



# 📱 Responsive Layout

The movie grid automatically adjusts depending on screen size.

Desktop → 6–8 movies per row
Laptop → 4–5 movies per row
Tablet → 2–3 movies per row
Mobile → 1–2 movies per row

---

# 📄 License

This project is open-source.

---

# 🙌 Credits

Movie data provided by TMDB.
