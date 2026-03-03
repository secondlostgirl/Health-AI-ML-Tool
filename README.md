# Health-AI-ML-Tool
# HEALTH-AI: ML Visualisation Tool for Healthcare

This repository contains the source code and documentation for the HEALTH-AI Machine Learning Visualisation Tool, developed as part of a 10-Week Agile development cycle.

## Repository Structure

Based on our system architecture, the repository is divided into frontend, backend, and documentation layers:

```text
HEALTH-AI-ML-Tool/
│
├── frontend/               # React 18 + Vite Application (UI Layer)
│   ├── src/
│   │   ├── components/     # Reusable UI components (Stepper, Sliders, Charts)
│   │   ├── pages/          # 7 Step screens (Clinical Context to Ethics & Bias)
│   │   └── App.jsx         # Main application routing
│   └── package.json        # Frontend dependencies
│
├── backend/                # FastAPI + Python Backend (API & ML Engine)
│   ├── api/                # REST API endpoints (upload, preprocess, train, predict)
│   ├── ml_engine/          # scikit-learn models (KNN, SVM, Decision Tree, etc.)
│   ├── data/               # Default domain CSV datasets (No persistent DB)
│   └── requirements.txt    # Python dependencies
│
├── docs/                   # Documentation & Design Assets
│   ├── architecture/       # Architecture diagrams
│   └── wireframes/         # Figma design exports
│
├── README.md               # Project overview and repository structure
└── SETUP.md                # Installation and local setup instructions (Skeleton)
