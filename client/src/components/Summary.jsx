function Summary({ recipe_id, title, time, votes }) {
    return (
        <li key={recipe_id}>
            <h2>{title}</h2>
            <p>Time: {time}</p>
            <p>Votes: {votes}</p>
        </li>
    )
}

export default Summary;