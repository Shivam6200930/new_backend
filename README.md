# E-commerce Backend

This is the backend service for the E-commerce Platform, built using Node.js, Express.js, and MongoDB. It provides RESTful APIs for managing products, users, orders, and authentication.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Folder Structure](#folder-structure)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **User Authentication**: Secure login and registration with JWT.
- **Product Management**: Create, read, update, and delete products.
- **Order Management**: Handle customer orders and order history.
- **User Management**: Admin features for managing users.
- **Database**: MongoDB for data storage.

## Installation

To set up the project locally, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Shivam6200930/new_backend.git
  ```

2.Install dependencies:
```
npm install
```
3.Environment Variables:

Create a .env file in the root directory and configure the following variables:

```
PORT=<your port number>

DATABASE_URL=<you mongodb url>

jwt_secret_key=<Enter your jwt secret key>

EMAIL_USER = <your email address>
EMAIL_PASS = <you password>


YOUR_CLOUD_NAME=<your cloud name>
YOUR_API_KEY=<api key>
YOUR_API_SECRET=<your api secret>


payment_key_id = <razorpay key id>
payment_key_secret = <payment key secret>

frontend_url = <your deploy url/Localhost:5173>
```

#Usage
To start the server locally, run the following command:

```
node index.js
```
and if you have nodemon install in your system then you will run the following command:
```
nodemon index.js
```
The server will start on `http://localhost:${port}`.


# API Endpoints
Here is a list of available API endpoints:

- **post** '/register'
- **post** '/login'
- **post** '/sendresetPassword'
- **put** '/resetPassword/:id/:token'
- **delete** '/delete/:id'
- **get** '/logout/:id'
- **put** '/edit/:user_id'
- **post** '/product'
- **get** '/search'
- **get** '/products'
- **post** '/contact'
- **post** '/imageupload/:id'
- **post** '/razorpay/order'
- **post** '/razorpay/capture
- **post** '/order_history/:userId'
- **post** 'razorpay/verify-signature'
- **delete** '/profileImageDelete/:id'
- **post** '/cartadd/:id'
- **put** '/cartupdate/:id'
- **delete** '/cartdelete/:id'
- **post** '/changepassword'
- **get** '/loggedUser'

# Folder Structure

ecommerce-backend/
│
├── src/
│   ├── controllers/         # API route controllers
│   ├── models/              # Mongoose models
│   ├── routes/              # Express routes
│   ├── middleware/          # Custom middleware
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   └── server.js            # Entry point for the server
│
├── .env                     # Environment variables
├── package.json             # Project metadata and dependencies
└── README.md                # Project documentation

# Technologies Used
## Backend:

- Node.js
- Express.js
- Database:

- MongoDB
- Mongoose
- Authentication:

- JWT (JSON Web Tokens)
- bcrypt for password hashing


# Contributing
Contributions are welcome! To contribute, please follow these guidelines:

1.Fork the repository.
2.Create a new branch with a descriptive name.
3.Make your changes and commit them with clear messages.
4.Push your changes to your fork.
5.Submit a pull request.

# Contact
For any questions or feedback, feel free to reach out to the project maintainers:

**Name** : `Shivam Mandal`
**Email** : `mandalshivam962@gmail.com`