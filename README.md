# LessonBookingSystem

A full-stack lesson booking system developed for the CST3144 Full Stack Development 2024-25 module.

---

## Project Overview

This application enables users to browse and book lessons for subjects like Chemistry, Biology, and more. It includes a shopping cart and checkout system, fully integrated with a MongoDB database backend.

---

## Features and Marking Criteria Coverage

### General Requirements

- Code hosted in two GitHub repositories:  
  - Vue.js front-end with 10+ commits  
  - Express.js backend with 10+ commits  
- Frontend hosted on GitHub Pages and connected to Express backend hosted on Render.com  
- Node/Express server deployed on Render.com (AWS alternative)

### Front-End Functionality

- Display list of at least 10 lessons, each with:  
  - Subject, Location, Price, Availability, and an icon/image  
- Use of Vue.js `v-for` for lesson list display  
- Sorting lessons by subject, location, price, or availability in ascending/descending order  
- "Add to Cart" button enabled only if lesson availability > 0  
- Shopping cart toggle with lesson add/remove functionality  
- Checkout form validating Name (letters only) and Phone (numbers only) using JavaScript regex  
- Confirmation message on successful order submission

### Search Functionality (Challenge)

- Full-text search implemented on backend via Express and MongoDB  
- Search results fetched and displayed dynamically on frontend (search as you type)

### Back-End and Database

- MongoDB collections for lessons and orders with required fields  
- Express middleware for request logging and static file serving for lesson images  
- REST API with routes:  
  - GET `/lessons` returns all lessons as JSON  
  - POST `/orders` saves a new order  
  - PUT `/lessons/:id` updates lesson attributes, including availability

### Fetch Functions

- Fetch lessons with GET request  
- Submit orders with POST request  
- Update lesson availability with PUT request

---

## Tech Stack

- Vue.js, JavaScript, HTML, CSS  
- Node.js, Express.js  
- MongoDB  
- Hosted on GitHub Pages and Render.com  
- Additional tools: Gradle, OpenAI, PyTorch (for other coursework)

---

## How to Run

1. Clone repositories (frontend and backend)  
2. Install dependencies (`npm install`)  
3. Configure MongoDB connection (e.g., environment variables)  
4. Run backend server (`npm start`)  
5. Serve frontend via GitHub Pages or locally (`npm run serve`)  

---

## Notes

This project was developed as a full-stack application demonstrating key web development concepts including REST APIs, database integration, and responsive UI design. The application meets the module marking criteria fully and is ready for demonstration.

---

