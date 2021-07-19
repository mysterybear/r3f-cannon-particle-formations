import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./components/App"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

ReactDOM.render(
  <React.StrictMode>
    <div className="full-screen">
      <Canvas
        camera={{ position: [0, 25, 50] }}
        onCreated={({ gl }) => void gl.setClearColor("black")}
      >
        <App />
        <OrbitControls autoRotate autoRotateSpeed={10} />
      </Canvas>
    </div>
  </React.StrictMode>,
  document.getElementById("root")
)
