function Summary({ title, time, votes }) {
    return (
        <li>
            <h2>{title}</h2>
            <p>Time: {time}</p>
            <p>Votes: {votes}</p>
        </li>
    )
}

export default Summary;