from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid

app = Flask(__name__)

CORS(app)

# In-memory storage for tests and submissions (resets when server restarts)
tests_db = {}
submissions_db = []

def get_fallback_questions(skills, count):
    """Returns high-quality technical questions for a working demo."""
    pool = [
        {
            "id": "q1",
            "skill": skills,
            "question": f"Which of the following is a primary best practice when working with {skills}?",
            "options": ["Efficient Resource Management", "Ignoring Documentation", "Hardcoding Values", "Manual Testing Only"],
            "correct_answer": "Efficient Resource Management"
        },
        {
            "id": "q2",
            "skill": skills,
            "question": f"In a professional environment, how is {skills} typically version controlled?",
            "options": ["Using Git", "Emailing zip files", "Saving on Desktop", "No version control needed"],
            "correct_answer": "Using Git"
        },
        {
            "id": "q3",
            "skill": skills,
            "question": f"Which tool is most commonly associated with testing {skills} code?",
            "options": ["Unit Testing Frameworks", "Notepad", "Calculator", "Social Media"],
            "correct_answer": "Unit Testing Frameworks"
        },
        {
            "id": "q4",
            "skill": skills,
            "question": f"What is the main advantage of using {skills} in modern development?",
            "options": ["Scalability", "Slower performance", "Harder to maintain", "Limited community support"],
            "correct_answer": "Scalability"
        },
        {
            "id": "q5",
            "skill": skills,
            "question": f"What is a common error to avoid when implementing {skills}?",
            "options": ["Memory leaks", "Proper indentation", "Commenting code", "Using meaningful variables"],
            "correct_answer": "Memory leaks"
        },
        {
            "id": "q6",
            "skill": skills,
            "question": f"How should sensitive configuration data in {skills} be managed?",
            "options": ["Environment variables", "Hardcoded in source", "Public comments", "Plain text files"],
            "correct_answer": "Environment variables"
        }
    ]
    # Return requested number or all available
    return pool[:min(len(pool), int(count))]

@app.route('/api/create-test', methods=['POST'])
def create_test():
    data = request.json
    test_id = str(uuid.uuid4())[:8]
    skills = data.get('skills', 'General Programming')
    num_q = data.get('numQuestions', 5)
    
    # Generate the questions
    questions = get_fallback_questions(skills, num_q)
    
    tests_db[test_id] = {
        "id": test_id,
        "skills": skills,
        "difficulty": data.get('difficulty', 'Medium'),
        "questions": questions,
        "timeLimit": int(data.get('timeLimit', 10))
    }
    return jsonify({"testId": test_id})

@app.route('/api/test/<test_id>', methods=['GET'])
def get_test(test_id):
    test = tests_db.get(test_id)
    if not test:
        return jsonify({"error": "Test not found"}), 404
    return jsonify(test)

@app.route('/api/submit-test', methods=['POST'])
def submit_test():
    data = request.json
    test = tests_db.get(data.get('testId'))
    if not test: 
        return jsonify({"error": "Test session expired or invalid"}), 404
        
    score = 0
    user_answers = data.get('answers', {})
    for q in test['questions']:
        # Compare user answer with correct answer
        if user_answers.get(q['id']) == q['correct_answer']:
            score += 1
            
    total = len(test['questions'])
    percentage = (score / total) * 100 if total > 0 else 0
    
    result = {
        "candidateName": data.get('candidateName', 'Guest'),
        "score": score,
        "total": total,
        "percentage": percentage,
        "status": "Pass" if percentage >= 60 else "Fail"
    }
    submissions_db.append(result)
    return jsonify({"result": result})

@app.route('/api/admin/submissions', methods=['GET'])
def get_submissions():
    return jsonify(submissions_db)

if __name__ == '__main__':
    # Run the Flask app on port 5000
    app.run(port=5000, debug=True)