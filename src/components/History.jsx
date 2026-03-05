function History({ history }) {

  return (
    <div>

      <h2>Interview History</h2>

      {history.map((item, index) => (

        <div key={index} style={{
          border: "1px solid #ddd",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "5px"
        }}>

          <strong>{item.role}</strong>

          <p>Score: {item.score.toFixed(1)} / 10</p>

        </div>

      ))}

    </div>
  );
}

export default History;