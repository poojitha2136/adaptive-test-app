# Adaptive Online Screening Test Generator (Web App)

## Problem Statement
Internship applicants come with diverse skill sets (Python, ML, Web, CV, etc.), but traditional one-size-fits-all screening tests fail to assess them fairly.

This project builds a web-based adaptive screening test system that automatically generates skill-specific, time-bound online tests, evaluates answers, and provides structured results for recruiters.

---

## Core Goal
Automatically generate, conduct, and evaluate skill-aligned screening tests for internship candidates.

---

## Features

### Admin / Recruiter
- Configure required skills (Python, React, ML, etc.)
- Select difficulty level (Easy / Medium / Hard)
- Set number of questions and test duration
- Generate unique test codes
- View candidate submissions and scores

### Candidate
- Enter test code and candidate name
- Timed test with auto-submit
- One-question-at-a-time navigation
- Automatic evaluation and result display

---

## Tech Stack

### Frontend
- React
- Tailwind CSS

### Backend
- Python
- Flask
- Flask-CORS

### Storage
- In-memory data structures (no database)



## Project Structure
```
adaptive-test-app/
│
├── client/ # Frontend (React)
│ ├── src/
│ │ ├── App.js
│ │ ├── index.js
│ │ └── index.css
│ └── package.json
│
├── server/ # Backend (Flask)
│ ├── app.py
│ └── requirements.txt
│
└── README.md


```
## How to Run Locally

### Backend
```bash
cd server
pip install -r requirements.txt
python app.py
```
## Backend runs on:
http://127.0.0.1:5000


### Frontend
```bash
cd client
npm install
npm start

```
## Frontend runs on:

http://localhost:3000

## Deployment

- Backend deployed as a **Render Web Service** using **Gunicorn**
- Frontend deployed as a **Render Static Site**

---

## Evaluation Criteria

- Correct implementation of test generation and evaluation  
- Fair randomization and time-bound execution  
- Clean and usable user interface  
- Practical relevance to internship hiring workflows  

---

## Expected Outcome

A working web application that demonstrates how **adaptive, skill-specific online tests** can replace static screening exams and improve **intern shortlisting quality**.

---

## Future Enhancements

- Adaptive difficulty adjustment based on candidate performance  
- Concept mastery analysis (identify strong and weak topics)  
- AI-based question generation using LLMs  
- CSV export of test results for recruiters  
