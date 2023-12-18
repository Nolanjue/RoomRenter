import React from 'react'

function Error({ error }) {
    return (
        <div>
            <div class="alert alert-warning" role="alert">
                Something went wrong:
            </div>
            <div class="alert alert-warning" role="alert">
                {error}
            </div>
        </div>

    )
}

export default Error