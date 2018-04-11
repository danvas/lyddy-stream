import React from 'react'

const SimpleBox = props => {
    const { title, body, footer } = props
    return (
        <div>
            <div>
                <div>
                    <div>
                        <div>
                            {title}
                        </div>
                        <div className="">
                            {body}
                        </div>
                        <div>
                        {footer}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SimpleBox;