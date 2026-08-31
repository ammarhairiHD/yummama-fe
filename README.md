# YumMama - Food Ordering App (Demo UI)

Created by **Ammar Bin Hairi**

A mobile-first React frontend web application for food ordering and restaurant management. This project is currently configured as an interactive visual demo with built-in mock data for exploring both Customer and Admin perspectives.

view here:

https://yummama-fe.vercel.app/login

---

## 📱 Project Overview

> **Note on Mobile View:** This application is strictly designed for **mobile viewport dimensions**. It is optimized for mobile browser screens or browser device simulation mode (F12 > Toggle Device Toolbar). 

* **Future Roadmap:** This web application serves as a design/architecture blueprint for an upcoming native cross-platform mobile application to be built using **Flutter**.
* **Database & Architecture:** Designed with **MongoDB** in mind for schema modeling and backend API integration.

---

## 🚀 Quick Start (Frontend Only)

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)
* `npm`, `yarn`, or `pnpm`

### 2. Installation & Running

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone <your-repository-url>

# Navigate to project directory
cd yummama

# Install dependencies
npm install

# Start the local development server
npm start
# or 
npm run dev

## 🔑 Demo Credentials

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `nasrul@yummama.com` | `yummama2026` | Full administrative control, order tracking, and menu management. |
| **👤 Customer** | `halusinasibyammar@gmail.com` | `test1234` | Food browsing, item customization, cart, and checkout flow. |

---

## 🐳 Docker Support

A `Dockerfile` is included in the project for containerizing the application.

### Build and Run with Docker

Run the following commands in your terminal:

```bash
docker build -t yummama-frontend .
