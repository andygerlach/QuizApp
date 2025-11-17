import { useEffect, useState } from "react";
import styles from "./QuizFetcher.module.css";
import SelectableQuestionList from "./SelectableQuestionList";

// All Open Trivia DB categories
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
        const saved = localStorage.getItem('selectedCategories');
        return saved ? JSON.parse(saved) : Object.fromEntries(Object.keys(CATEGORY_IDS).map(cat => [cat, 0]));
    });

    const [questions, setQuestions] = useState(() => {
        const saved = localStorage.getItem('questions');
        return saved ? JSON.parse(saved) : [];
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (category, value) => {
        const updated = { ...selectedCategories, [category]: Number(value) };
        setSelectedCategories(updated);
        localStorage.setItem('selectedCategories', JSON.stringify(updated));
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
            const combined = results.flatMap(r => r.results || []).map((q, index) => ({
                ...q,
                id: `${Date.now()}-${index}`
            }));

            setQuestions(combined);
            localStorage.setItem('questions', JSON.stringify(combined));
        } catch (err) {
            setError("Failed to load questions.");
        } finally {
            setLoading(false);
        }
    };

    // Reset API questions and category selections
    const resetQuestionsOnly = () => {
        setQuestions([]);
        const resetCategories = Object.fromEntries(Object.keys(CATEGORY_IDS).map(cat => [cat, 0]));
        setSelectedCategories(resetCategories);
        localStorage.removeItem('questions');
        localStorage.setItem('selectedCategories', JSON.stringify(resetCategories));
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
                            {Array.from({ length: 11 }, (_, i) => (
                                <option key={i} value={i}>{i}</option>
                            ))}
                        </select>
                    </div>
                ))}

                <button onClick={fetchQuestions} className={styles.button}>
                    Generate Quiz
                </button>
                <button onClick={resetQuestionsOnly} className={styles.button} style={{ backgroundColor: '#ff4d4d' }}>
                    Reset Questions
                </button>
            </div>

            <p>Total questions selected: {totalSelected}</p>

            {loading && <p>Loading …</p>}
            {error && <p className={styles.error}>{error}</p>}

            {/* Only display persistent selected questions */}
            <h2 className={styles.subtitle}>Selected Questions (Persistent)</h2>
            <SelectableQuestionList questions={questions} />
        </div>
    );
}

