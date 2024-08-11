import Header from "./components/Header";
import StegContainer from "./components/StegContainer";

function App() {
  return (
    <div className="">
      <Header />
      <StegContainer
        stegTechnique={"Linear LSB"}
        encodeUri={"/api/steg/llsb/encode"}
        decodeUri={"/api/steg/llsb/decode"}
      />
      <StegContainer
        stegTechnique={"Random LSB"}
        encodeUri={"/api/steg/rlsb/encode"}
        decodeUri={"/api/steg/rlsb/decode"}
      />
    </div>
  );
}

export default App;
