from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import os

app = Flask(__name__)

# Permissive CORS to ensure the frontend can always connect
CORS(app, resources={r"/api/*": {"origins": "*"}})

# In-memory storage (Resets if the Render server restarts)
tests_db = {}
submissions_db = []

def get_fallback_questions(skills, count):
    """Pool of 10 questions to ensure 'count' always works up to 10."""
    pool = [
        {"id": "q1", "skill": skills, "question": f"Which is a primary best practice when working with {skills}?", "options": ["Efficient Resource Management", "Ignoring Documentation", "Hardcoding Values", "Manual Testing Only"], "correct_answer": "Efficient Resource Management"},
        {"id": "q2", "skill": skills, "question": f"In a professional environment, how is {skills} typically version controlled?", "options": ["Using Git", "Emailing zip files", "Saving on Desktop", "No version control"], "correct_answer": "Using Git"},
        {"id": "q3", "skill": skills, "question": f"Which tool is most commonly associated with testing {skills} code?", "options": ["Unit Testing Frameworks", "Notepad", "Calculator", "Social Media"], "correct_answer": "Unit Testing Frameworks"},
        {"id": "q4", "skill": skills, "question": f"What is a main advantage of using {skills} in modern development?", "options": ["Scalability", "Slower performance", "Harder to maintain", "Limited support"], "correct_answer": "Scalability"},
        {"id": "q5", "skill": skills, "question": f"What is a common error to avoid when implementing {skills}?", "options": ["Memory leaks", "Proper indentation", "Commenting code", "Meaningful variables"], "correct_answer": "Memory leaks"},
        {"id": "q6", "skill": skills, "question": f"How should sensitive configuration data in {skills} be managed?", "options": ["Environment variables", "Hardcoded in source", "Public comments", "Plain text files"], "correct_answer": "Environment variables"},
        {"id": "q7", "skill": skills, "question": f"Which principle helps in maintaining clean code in {skills}?", "options": ["DRY (Don't Repeat Yourself)", "WET", "Copy-Paste", "Hardcoding"], "correct_answer": "DRY (Don't Repeat Yourself)"},
        {"id": "q8", "skill": skills, "question": f"What is the first step in debugging a {skills} application?", "options": ["Checking error logs", "Reinstalling OS", "Deleting project", "Ignoring error"], "correct_answer": "Checking error logs"},
        {"id": "q9", "skill": skills, "question": f"In {skills}, what does 'Refactoring' mean?", "options": ["Improving code structure", "Adding new features", "Deleting all code", "Changing UI only"], "correct_answer": "Improving code structure"},
        {"id": "q10", "skill": skills, "question": f"Which of these is essential for {skills} team collaboration?", "options": ["Code Reviews", "Working in silos", "Never sharing code", "Manual deployment"], "correct_answer": "Code Reviews"}
    ]
    return pool[:min(len(pool), int(count))]

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "active", "storage_count": len(tests_db)})

@app.route('/api/create-test', methods=['POST'])
def create_test():
    try:
        data = request.json
        # Generate a clean, lowercase ID
        test_id = str(uuid.uuid4())[:8].lower()
        skills = data.get('skills', 'General Programming')
        num_q = int(data.get('numQuestions', 5))
        
        questions = get_fallback_questions(skills, num_q)
        
        tests_db[test_id] = {
            "id": test_id,
            "skills": skills,
            "difficulty": data.get('difficulty', 'Medium'),
            "questions": questions,
            "timeLimit": int(data.get('timeLimit', 10))
        }
        return jsonify({"testId": test_id, "status": "created"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/test/<test_id>', methods=['GET'])
def get_test(test_id):
    # Normalize input to lowercase to match our dictionary keys
    search_id = test_id.strip().lower()
    test = tests_db.get(search_id)
    
    if not test:
        return jsonify({"error": "Test code not found or expired. Please create a new test."}), 404
    
    return jsonify(test)

@app.route('/api/submit-test', methods=['POST'])
def submit_test():
    data = request.json
    test_id = data.get('testId', '').lower()
    test = tests_db.get(test_id)
    
    if not test: 
        return jsonify({"error": "Session expired"}), 404
        
    score = 0
    user_answers = data.get('answers', {})
    for q in test['questions']:
        if user_answers.get(q['id']) == q['correct_answer']:
            score += 1
            
    total = len(test['questions'])
    res = {
        "candidateName": data.get('candidateName', 'Guest'),
        "score": score,
        "total": total,
        "percentage": int((score/total)*100) if total > 0 else 0,
        "status": "Pass" if (score/total) >= 0.6 else "Fail"
    }
    submissions_db.append(res)
    return jsonify({"result": res})

@app.route('/api/admin/submissions', methods=['GET'])
def get_submissions():
    return jsonify(submissions_db)

if __name__ == '__main__':
    # Listen on all interfaces for Render
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)