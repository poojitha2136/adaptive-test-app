import json

def evaluate(questions):
    score = 0
    for q in questions:
        if q["type"] == "mcq" and q["candidate_answer"] == q["correct_answer"]:
            score += 1
        elif q["type"] == "short":
            if all(k in q["candidate_answer"].lower() for k in q["keywords"]):
                score += 1
    return score

def main():
    with open("tests/test_data.json") as f:
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
