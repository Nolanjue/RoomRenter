import React, { useState, CSSProperties } from "react";
import HashLoader from 'react-spinners/HashLoader'


function Loader() {

    let [loading, setLoading] = useState(true);
    let [color, setColor] = useState("yellow");


    const override= {
        display: "block",
        margin: "0 auto",
        borderColor: "black",
    };
    return (
        <div className="sweet-loading">
            <HashLoader
                color={color}
                loading={loading}
                cssOverride={override}
                size={100}
                aria-label="Loading Spinner"
                data-testid="loader"
            />
        </div>
    )
}

export default Loader