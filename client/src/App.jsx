import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [dataToDisplay, setDataToDisplay] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/api")
      .then((response) => response.json())
      .then(handleSuccess, handleError);
  }, []);

  function handleSuccess(data) {
    console.log(data);
    setTimeout(() => {
      setDataToDisplay(data);
    }, 3000);
  }

  function handleError(error) {
    console.log(error);
  }

  if (dataToDisplay) {
    const list = [];

    for (const data in dataToDisplay) {
      list.push(<p>{dataToDisplay[data]}</p>);
    }

    return <div>{list}</div>;
  } else {
    return (
      <div className="App">
        <p>No data to render!</p>
      </div>
    );
  }
}

export default App;
