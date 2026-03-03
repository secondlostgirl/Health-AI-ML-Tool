#HEALTH-AI: Local Setup Guide (Skeleton)
This document provides the necessary steps to set up the HEALTH-AI project locally for development and testing.

Prerequisites
Before you begin, ensure you have the following installed on your machine:

Node.js (v18+) & npm

Python (3.10+)

Git

1. Backend Setup (FastAPI & scikit-learn)
Navigate to the backend directory and set up the Python environment:

# Navigate to backend folder
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server locally
uvicorn main:app --reload
The backend API will be available at: http://localhost:8000
API Documentation (Swagger UI) will be available at: http://localhost:8000/docs

2. Frontend Setup (React 18 + Vite)
Navigate to the frontend directory and run the development server:

# Navigate to frontend folder
cd frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev

The React frontend will be available at: http://localhost:5173
