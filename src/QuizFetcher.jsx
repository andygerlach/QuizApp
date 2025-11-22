import { useEffect, useState } from "react";
import styles from "./QuizFetcher.module.css";
import SelectableQuestionList from "./SelectableQuestionList";

const CATEGORY_IDS = {
    "General Knowledge": 9,
    "Books": 10,
    "Film": 11,
    "Music": 12,
    "Musicals & Theatres": 13,
    "Television": 14,
    "Video Games": 15,
    "Board Games": 16,
    "Science & Nature": 17,
    "Computers": 18,
    "Mathematics": 19,
    "Mythology": 20,
    "Sports": 21,
    "Geography": 22,
    "History": 23,
    "Politics": 24,
    "Art": 25,
    "Celebrities": 26,
    "Animals": 27,
    "Vehicles": 28,
    "Comics": 29,
    "Gadgets": 30,
    "Anime & Manga": 31,
    "Cartoon & Animations": 32,
};

export default function QuizFetcher() {
    const [selectedCategories, setSelectedCategories] = useState(() => {
        const saved = localStorage.getItem("selectedCategories");
        return saved ? JSON.parse(saved) : Object.fromEntries(Object.keys(CATEGORY_IDS).map(cat => [cat, 0]));
    });

    const [questions, setQuestions] = useState(() => {
        const saved = localStorage.getItem("questions");
        return saved ? JSON.parse(saved) : [];
    });

    // NEW: track previously shown questions
    const [shownQuestions, setShownQuestions] = useState(() => {
        const saved = localStorage.getItem("shownQuestions");
        return saved ? JSON.parse(saved) : [];
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (category, value) => {
        const updated = { ...selectedCategories, [category]: Number(value) };
        setSelectedCategories(updated);
        localStorage.setItem("selectedCategories", JSON.stringify(updated));
    };

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            setError(null);

            const promises = Object.entries(selectedCategories)
                .filter(([cat, amount]) => amount > 0)
                .map(([cat, amount]) => {
                    const id = CATEGORY_IDS[cat];
                    return fetch(
                        `https://opentdb.com/api.php?amount=${amount}&category=${id}&type=multiple`
                    ).then(res => res.json());
                });

            const results = await Promise.all(promises);

            // Flatten results
            const fetched = results.flatMap(r => r.results || []);

            // NEW: filter out previously shown questions
            const filtered = fetched.filter(q => !shownQuestions.includes(q.question));

            // Add unique IDs
            const finalQuestions = filtered.map((q, index) => ({
                ...q,
                id: `${Date.now()}-${index}`
            }));

            // Update current questions only with fresh unseen ones
            setQuestions(finalQuestions);
            localStorage.setItem("questions", JSON.stringify(finalQuestions));

            // Update shown history
            const updatedShown = [...shownQuestions, ...filtered.map(q => q.question)];
            setShownQuestions(updatedShown);
            localStorage.setItem("shownQuestions", JSON.stringify(updatedShown));

        } catch (err) {
            setError("Failed to load questions.");
        } finally {
            setLoading(false);
        }
    };

    // Reset quiz UI + categories, BUT KEEP HISTORY
    const resetQuestionsOnly = () => {
        setQuestions([]);
        const resetCategories = Object.fromEntries(Object.keys(CATEGORY_IDS).map(cat => [cat, 0]));
        setSelectedCategories(resetCategories);
        localStorage.removeItem("questions");
        localStorage.setItem("selectedCategories", JSON.stringify(resetCategories));
    };

    // OPTIONAL: reset history too if needed
    const resetShownHistory = () => {
        setShownQuestions([]);
        localStorage.removeItem("shownQuestions");
    };

    const totalSelected = Object.values(selectedCategories).reduce((a, b) => a + b, 0);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Custom Quiz by Category</h1>

            <div className={styles.form}>
                {Object.keys(selectedCategories).map(cat => (
                    <div key={cat} className={styles.inputGroup}>
                        <label>{cat}:</label>
                        <select
                            value={selectedCategories[cat]}
                            onChange={e => handleInputChange(cat, e.target.value)}
                        >
                            {Array.from({ length: 51 }, (_, i) => (
                                <option key={i} value={i}>{i}</option>
                            ))}
                        </select>
                    </div>
                ))}

                <button onClick={fetchQuestions} className={styles.button}>
                    Generate Quiz
                </button>

                <button
                    onClick={resetQuestionsOnly}
                    className={styles.button}
                    style={{ backgroundColor: "#ff4d4d" }}
                >
                    Reset Questions
                </button>

                <button
                    onClick={resetShownHistory}
                    className={styles.button}
                    style={{ backgroundColor: "#d9534f" }}
                >
                    Reset History
                </button>
            </div>

            <p>Total questions selected: {totalSelected}</p>
            <p>Unique questions shown so far: {shownQuestions.length}</p>

            {loading && <p>Loading …</p>}
            {error && <p className={styles.error}>{error}</p>}

            <h2 className={styles.subtitle}></h2>
            <SelectableQuestionList questions={questions} />
        </div>
    );
}
