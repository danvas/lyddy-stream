import React from 'react';

const FooterFormButton = props => {
    const { submitLabel, otherLabel, goToLink, history } = props;

    return (
        <div className="d-flex justify-content-between">
            <button type="submit">{submitLabel}</button>
            <button type="button" 
            onClick={() => history.push(goToLink)}>{otherLabel}</button>
        </div>
    )
}

export default FooterFormButton;