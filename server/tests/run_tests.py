import json
import os

def evaluate(questions):
    score = 0
    for q in questions:
        if q["type"] == "mcq":
            if q["candidate_answer"] == q["correct_answer"]:
                score += 1
        elif q["type"] == "short":
            if all(k.lower() in q["candidate_answer"].lower() for k in q["keywords"]):
                score += 1
    return score

def main():
    base_dir = os.path.dirname(__file__)
    data_path = os.path.join(base_dir, "test_data.json")

    with open(data_path) as f:
        data = json.load(f)

    print("=== Running Evaluation Test Cases ===\n")

    for tc in data["testcases"]:
        score = evaluate(tc["questions"])
        status = "PASS" if score == tc["expected_score"] else "FAIL"

        print(f"Test Case: {tc['name']}")
        print(f"Expected Score: {tc['expected_score']}")
        print(f"Actual Score: {score}")
        print(f"STATUS: {status}")
        print("-" * 40)

if __name__ == "__main__":
    main()
