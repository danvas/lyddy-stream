import React from 'react';
import SimpleBox from './SimpleBox' 

function isVowel(char) {
    return /^[aeiou]$/.test(char.toLowerCase());
}

const InputField = props => {
    return (
        <div>
            <label htmlFor={props.id}> {props.label}</label>
            <div>
                <input onChange={props.inputAction} 
                       type={props.type} 
                       placeholder={`Please enter ${isVowel(props.label[0])? "an" : "a"} ${props.label}`}
                       style={props.style}
                />
            </div>
        </div>
    )
}

export default InputField;