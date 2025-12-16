// React hooks not needed for this component currently
import { Link } from 'react-router-dom'
import './Flows.css'

const yogaFlows = {
    "Beginner Flow": {
        poses: ["Tree", "Chair", "Triangle"],
        duration: "5 minutes",
        difficulty: "Beginner",
        description: "Perfect for starting your yoga journey"
    },
    "Strength Builder": {
        poses: ["Warrior", "Chair", "Shoulderstand"],
        duration: "8 minutes",
        difficulty: "Intermediate",
        description: "Build core strength and stability"
    },
    "Flexibility Focus": {
        poses: ["Cobra", "Triangle", "Tree"],
        duration: "6 minutes",
        difficulty: "Beginner",
        description: "Improve flexibility and balance"
    },
    "Full Body Flow": {
        poses: ["Tree", "Warrior", "Dog", "Cobra", "Chair", "Triangle", "Shoulderstand"],
        duration: "12 minutes",
        difficulty: "Advanced",
        description: "Complete workout for all muscle groups"
    }
}

export default function Flows() {
    // Future feature: const [selectedFlow, setSelectedFlow] = useState(null)

    return (
        <div className="flows-container">
            <h1>Yoga Flows</h1>
            <p>Follow guided sequences for a complete yoga experience</p>

            <div className="flows-grid">
                {Object.entries(yogaFlows).map(([flowName, flowData]) => (
                    <div key={flowName} className="flow-card">
                        <h3>{flowName}</h3>
                        <div className="flow-info">
                            <span className={`difficulty ${flowData.difficulty.toLowerCase()}`}>
                                {flowData.difficulty}
                            </span>
                            <span className="duration">{flowData.duration}</span>
                        </div>
                        <p>{flowData.description}</p>

                        <div className="poses-preview">
                            {flowData.poses.map((pose, index) => (
                                <span key={pose} className="pose-chip">
                                    {pose}
                                    {index < flowData.poses.length - 1 && " → "}
                                </span>
                            ))}
                        </div>

                        <Link
                            to={`/yoga?flow=${encodeURIComponent(flowName)}`}
                            className="start-flow-btn"
                        >
                            Start Flow
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}