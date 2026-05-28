import Video from "./pages/Video"
import CustomTitleBar from "./components/CustomTitleBar"
import "./components/CustomTitleBar.css"
import "./App.css"

function App(): React.JSX.Element {

  return (
    <div className="app-container">
      <CustomTitleBar title="QiQClaw - Video WorkBase" />
      <div className="app-main-header">
        <div className="app-center-title">
          <p>QiQClaw</p>
          <p>AI</p>
        </div>
        <div className="app-center-desc">
          <p>助力AI智能体快速落地应用</p>
        </div>
      </div>
      <Video />
    </div>
  )
}

export default App
