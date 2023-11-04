import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

const Confirmed = () => {
    const navigate = useNavigate()

    const redirectAfterDelay = delay => {
        setTimeout(() => {
            navigate("/login")
        }, delay)
    }
    
    useEffect(() => {
        redirectAfterDelay(3000)
    }, [])

    const style = {
        textAlign: "center",
        marginTop: "150px",
        fontSize: "25px"
    }
    
    return (
        <div style={style}>
            Your email has been confirmed. You can now log in.
        </div>
    )
}

export default Confirmed