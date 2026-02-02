import json
import os

def evaluate(questions):
    score = 0
    for q in questions:
        if q["type"] == "mcq" and q["candidate_answer"] == q["correct_answer"]:
            score += 1
        elif q["type"] == "short":
            if all(k.lower() in q["candidate_answer"].lower() for k in q["keywords"]):
                score += 1
    return score

def main():
    # Get absolute path to test_data.json (works in Docker + VS Code)
    base_dir = os.path.dirname(__file__)
    data_path = os.path.join(base_dir, "test_data.json")

    with open(data_path, "r") as f:
        data = json.load(f)

    score = evaluate(data["questions"])

    print("=== Evaluation Test ===")
    print("Expected Score:", data["expected_score"])
    print("Actual Score:", score)

    if score == data["expected_score"]:
        print("STATUS: PASS")
    else:
        print("STATUS: FAIL")

if __name__ == "__main__":
    main()
