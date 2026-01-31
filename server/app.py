from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import os # Required to get the Port from Render

app = Flask(__name__)

# This allows your specific Render frontend to talk to this backend
CORS(app)

# In-memory storage
tests_db = {}
submissions_db = []

def get_fallback_questions(skills, count):
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
        }
    ]
    return pool[:min(len(pool), int(count))]

@app.route('/api/create-test', methods=['POST'])
def create_test():
    data = request.json
    test_id = str(uuid.uuid4())[:8]
    skills = data.get('skills', 'General Programming')
    num_q = data.get('numQuestions', 5)
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
    # RENDER FIX: Use the port Render gives you, and listen on 0.0.0.0
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)