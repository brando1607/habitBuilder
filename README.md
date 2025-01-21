# Habit Builder

This is the **Habit Builder** page, a project designed for my portfolio to showcase my backend development skills. Initially, I planned to create a to-do list, but I decided to take it to the next level.

Deployed and available at **habitbuilder-production.up.railway.app**

## Why I Built This

Backend development is my strongest suit, so I will focus on creating a robust backend first. Once completed, I’ll develop the best frontend I can to deliver an engaging user experience.

## Core Features

### Points and Leveling

- Earn points each time a habit is completed.
- Level up based on points accumulated.
- Levels are theme-based, with unique names based on the theme chosen during user registration.

### Badge System

- Badges are assigned automatically to habits if a keyword matches.
- Badges can level up as habits are completed, increasing points earned.

### Habit Workflow

- **Add Habits:** Assign a date to a habit.
  - Current-day habits are marked "in progress."
  - Future habits are marked "scheduled."
- **Complete Habits:** Habits can only be completed on their deadline day.
- **Delete Habits:** Future habits can be deleted but not marked as completed.

### User Profile Management

- Update email address, username, or password.
- Ensure secure and flexible account management.

### Badge Suggestions

- Users can propose new badges.
- An admin evaluates suggestions.
- Users receive an email notification about acceptance or rejection.

### Friend System

- Users can send friend requests to each other.
- Friend requests can be **accepted** or **rejected** by the recipient.
- Once accepted, both users are added to each other's friend list.

### Messages System

- Chats between two users can be retrieved.
- Messages can be sent only if the users are friends with each other.
- Messages can be modified.
- Messages can be deleted.

## Technical Details

The **`backend/config`** folder contains a `script.sql` file with:

- Definitions for all tables, indexes, and triggers.
- Predefined levels and badges.
- Points awarded per habit completion.
- Requirements for user and badge level progression.

## Technologies Used

This project is built using the following technologies and libraries:

- **Node.js**: For the backend server.
- **Express.js**: To create routes and handle HTTP requests.
- **bcrypt**: For password hashing.
- **crypto**: To encrypt and decrypt users' email addresses.
- **cookie-parser**: To handle cookies.
- **CORS**: To enable cross-origin resource sharing.
- **express-compression**: To compress responses.
- **jsonwebtoken**: For authentication via JWTs.
- **MySQL2**: To interact with the MySQL database.
- **Nodemailer**: To send emails for notifications (e.g., badge suggestions, temporary passwords and password changes).
- **Passport.js**: For user authentication.
- **Passport-JWT**: For handling JWT-based authentication.
- **Redis**: For caching.

## Development Status

This project is a **work in progress**. I will update it regularly as new features are added or existing ones are improved.

- The **`pending`** folder contains `.txt` files listing:
  - Planned features for both the app and the database.
  - Areas for improvement, like enhancing database performance and user experience.

---

I’m excited to continue working on this app and make it a valuable addition to my portfolio.
