# CineMasr 🎬🍿

[![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express.js-%23404D59.svg?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Bootstrap](https://img.shields.io/badge/bootstrap-%238511FA.svg?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)

**CineMasr** is a full-stack cinema and theater seat reservation web platform developed as the graduation project for the **Information Technology Institute (ITI)** Backend Training program. 

The platform provides a seamless booking experience, featuring movie catalog management, showtime scheduling, dynamic seat selection, and a secure RESTful backend architecture.

---
## 🚀 Key Features

* **User Authentication & Management:** Secure registration, login, and session authorization for users and administrators.
* **Movie & Showtime Catalog:** Browse currently showing films, schedules, genres, and theater halls.
* **Dynamic Seat Allocation:** Interactive seat selection workflow preventing double-booking and managing real-time availability.
* **RESTful API Architecture:** Clean separation of concerns with structured Express controllers, routes, and middleware.
* **Database Modeling & Seeding:** Robust MongoDB schemas managed via Mongoose ODM, accompanied by automated data seeders for rapid testing and deployment.
* **Responsive Frontend Flow:** Mobile-friendly user interface built using HTML5, modern JavaScript, and Bootstrap.

---
## 🛠 Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database & ODM:** MongoDB, Mongoose
* **Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap
* **Versioning & Tools:** Git, Postman (API testing)

---
## ⚙️ Getting Started & Installation

To run this project locally, follow these steps:

### Prerequisites
* Ensure you have [Node.js](https://nodejs.org/) installed.
* Ensure you have a running [MongoDB](https://www.mongodb.com/) instance (local service or MongoDB Atlas cluster).

### 1. Clone the Repository
```bash
git clone [https://github.com/karimmamdouh919/CineMasr.git](https://github.com/karimmamdouh919/CineMasr.git)
cd CineMasr

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and configure your environment variables:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_here

```

### 4. Run the Application

```bash
# Start in development mode (with nodemon)
npm run dev

# Or start in production mode
npm start

```

The server will run on `http://localhost:3000`.

---
## 👥 Project Team

CineMasr was built collaboratively as a team project during the ITI backend training program:

* [Karim Mamdouh](https://github.com/karimmamdouh919)
* [Said Ahmed](https://github.com/said-ahmed12)
* [Nour Ali](https://github.com/xxNOURxx501)
* [Shahd Khaled](https://github.com/shahdkhaled13)
* [Yara Mohammed](https://github.com/yaramooo)
