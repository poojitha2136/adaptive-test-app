
# Project Title

A brief description of what this project does and who it's for

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
- In-memory data structures 



## Project Structure
```
ADAPTIVE-TEST-APP-MAIN/
│
├── client/ # Frontend (React + Tailwind)
│ ├── public/
│ │ ├── favicon.ico
│ │ ├── index.html
│ │ ├── logo192.png
│ │ ├── logo512.png
│ │ ├── manifest.json
│ │ └── robots.txt
│ │
│ ├── src/
│ │ ├── App.js
│ │ ├── App.css
│ │ ├── App.test.js
│ │ ├── index.js
│ │ ├── index.css
│ │ ├── logo.svg
│ │ ├── reportWebVitals.js
│ │ └── setupTests.js
│ │
│ ├── tailwind.config.js
│ ├── package.json
│ ├── package-lock.json
│ ├── .gitignore
│ └── README.md
│
├── server/ # Backend (Flask API)
│ ├── app.py
│ ├── requirements.txt
│ └── venv/
│
├── Dockerfile # Docker configuration
├── package.json
├── package-lock.json
├── .gitignore
└── README.md


```
## How to Run Locally

### Backend
```bash
cd server
pip install -r requirements.txt
python app.py
```



### Frontend
```bash
cd client
npm install
npm start

```



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

  
## Containerization and Tooling
- Docker
- Node.js and npm
- Environment variables using .env
- Git and GitHub
## System Inputs 
1. Admin / Recruiter Inputs
-  Skill domain selection (Python, React, Machine Learning, etc.)
- Difficulty level (Easy / Medium / Hard)
- Number of questions to be generated
- Test duration (time limit)
- Test generation request
2. Candidate Inputs
- Test access code
- Candidate name
- Answers submitted for each question
- Test submission action
## System Outputs
1. Outputs for Admin / Recruiter

- Unique test access code
- Generated skill-specific question set
- Candidate performance scores
2. Outputs for Candidate
- Timed online test interface
- Automatic evaluation of responses
- Final score and total marks
- Test completion confirmation
## How It Works

1. The recruiter configures the test by selecting required skills, difficulty level, number of questions, and time limit.
2. The system randomly generates a skill-specific question set and creates a unique test access code.
3. The candidate enters the test code, provides their name, and starts the timed assessment.
4. Questions are displayed one at a time, and the timer runs continuously.
5. On submission or time expiry, the system automatically evaluates answers.
6. The final score is calculated and shown to the candidate and recruiter.
## Live Deployment
Live Web Application:

https://adaptive-test-app-9.onrender.com/

## Quick Start (Local Development)

This project can be used either via the live deployed application or by running it locally for full-stack testing.

# Prerequisites

- Python 3.10+

- Node.js 18+

- npm
- Git

- Modern web browser (Chrome, Edge, Firefox)

- Docker & Docker Compose (optional)
## Option 1: Use the Deployed Application (Recommended)

- No local setup required.

- Open the live website

- Recruiter generates a test

- Candidate joins using test code

- Results are auto-evaluated
## Option 2: Run Locally (Manual Setup)

## Step 1: Clone the Repository
git clone https://github.com/your-username/adaptive-test-app.git
cd adaptive-test-app

## Step 2: Run the Backend (Flask API)
cd server
pip install -r requirements.txt
python app.py


Backend runs at:

http://127.0.0.1:5000

## Step 3: Run the Frontend (React)
cd client
npm install
npm start


Frontend runs at:

http://localhost:3000

## Option 3: Run Using Docker (Optional)

- Docker runs frontend and backend together.

- docker compose up --build

From the project root directory run:

```bash
docker build -t adaptive-test .
```
## Option 4: Run Docker container (runs test cases)
```bash
docker run adaptive-test
```
This:

Builds frontend & backend images

Runs both services together

Ensures consistent environment

## Expected Output

Recruiter can create skill-based tests

System generates unique test codes

Candidates complete timed assessments

Automatic score calculation and display

##  API Endpoints
1. Create Test

```POST /create-test```

## Request (JSON):
```bash
{
  "skill": "python",
  "count": 5
}
```



Response:
```bash
{
  "test_code": "A1B2C3"
}
````

2. Get Test Questions

```GET /get-test/{test_code}```

Response:
```bash
[
  { "q": "What is Python?" }
]
```
3. Submit Answers

```POST /submit```

## Request (JSON):
```bash
{
  "code": "A1B2C3",
  "answers": ["def"]
}
```


Response:
```bash
{
  "score": 3,
  "total": 5
}
```

## Authors
- Devi Priya

- Poojitha
## Edge Cases and Limitations 

Positive Edge Cases
- Candidate refreshes the page during the test → answers may be lost
- Multiple candidates using the same test code at the same time
- Auto-submit triggered when time expires during an unanswered question
- Invalid or expired test code entered by candidate
Negative Edge Cases

- Uses in-memory storage
- Not designed for high concurrent users
## Future Enhancements

- Adaptive difficulty adjustment based on candidate performance  
- Concept mastery analysis (identify strong and weak topics)  
- AI-based question generation using LLMs  
- CSV export of test results for recruiters
## Contributing

Contributions are welcome to improve this project.

You can contribute by:
- Submitting pull requests for bug fixes or new features
- Reporting issues or suggesting enhancements
- Improving documentation or UI/UX

## Acknowledgments

- Thanks to the open-source community for libraries and tools used in this project
- Inspiration drawn from modern online assessment and internship screening platforms
- Special appreciation to mentors, instructors, and peers for guidance and feedback during development
- Built using React, Flask, and Tailwind CSS, which made rapid development possible
