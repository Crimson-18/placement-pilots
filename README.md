# Placement Pilot - College Placement Intelligence Platform

## Project Overview

Placement Pilot is a comprehensive college placement intelligence platform that helps students prepare for placements, check eligibility, and learn from real interview experiences shared by other students.

## Features

- 🎯 **Eligibility Checker**: Check your eligibility for companies based on CGPA, branch, and skills
- 📖 **Interview Experiences**: Browse verified interview experiences from real placements
- 🏢 **Company Database**: Explore companies, their selection criteria, and required skills
- 💾 **User Profiles**: Maintain your profile with branch, CGPA, and graduation year
- ❤️ **Like System**: Rate and like experiences that helped you
- 🔐 **Email Verification**: Secure authentication system

## How can I edit this code?

You can work locally using your preferred IDE. Simply clone this repository and make your changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

You can deploy this project to various platforms:

### Deploy to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically build and deploy your project
4. Set environment variables for Supabase in project settings

### Deploy to Other Platforms
- **Netlify**: Connect GitHub repo for continuous deployment
- **AWS Amplify**: Deploy directly from Git repository
- **Traditional Servers**: Use `npm run build` and serve the `dist` folder

## Custom Domain Setup

To connect a custom domain to your deployed application:

1. Purchase a domain from a registrar
2. Update DNS records to point to your deployment platform
3. Configure the domain in your hosting platform's settings
4. Enable SSL/TLS for secure connections
