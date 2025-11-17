import { useEffect, useState } from "react";
import styles from "./SelectableQuestionList.module.css";

export default function SelectableQuestionList({ questions }) {
    const [selected, setSelected] = useState(() => {
        const saved = localStorage.getItem("selectedQuestions");
        return saved ? JSON.parse(saved) : [];
    });

    const toggle = (q) => {
        setSelected((prev) => {
            const exists = prev.find((x) => x.question === q.question);
            return exists
                ? prev.filter((x) => x.question !== q.question)
                : [...prev, q];
        });
    };

    useEffect(() => {
        localStorage.setItem("selectedQuestions", JSON.stringify(selected));
    }, [selected]);

    const reset = () => {
        setSelected([]);
        localStorage.removeItem("selectedQuestions");
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Select Questions for Custom Quiz</h2>

            <div className={styles.list}>
                {questions.map((q, idx) => {
                    const active = selected.find((x) => x.question === q.question);
                    return (
                        <div
                            key={idx}
                            className={`${styles.item} ${active ? styles.selected : ""}`}
                            onClick={() => toggle(q)}
                        >
                            <span dangerouslySetInnerHTML={{ __html: q.question }} />
                        </div>
                    );
                })}
            </div>

            <h3 className={styles.subtitle}>Selected ({selected.length})</h3>
            <div className={styles.selectedList}>
                {selected.map((q, idx) => (
                    <div
                        key={idx}
                        className={styles.item}
                        onClick={() => toggle(q)}
                    >
                        <span dangerouslySetInnerHTML={{ __html: q.question }} />
                        <p className={styles.answer} dangerouslySetInnerHTML={{ __html: q.correct_answer }} />
                    </div>
                ))}
            </div>

            <button className={styles.resetButton} onClick={reset}>
                Reset Selected
            </button>
        </div>
    );
}