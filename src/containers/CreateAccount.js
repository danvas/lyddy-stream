import React, {Component} from 'react';
import InputField from '../components/InputField'
import FooterFormButton from '../components/FooterFormButton'
import SimpleBox from '../components/SimpleBox'
import ErrorAlert from '../components/ErrorAlert'
import { createAccount } from '../actions/UserActions'
import { connect } from 'react-redux';

class CreateAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            confirmPassword: ''
        }
    }

    isValid() {
        const { email, password, confirmPassword } = this.state;

        if(email === '' || password === '' || confirmPassword === '') {
            this.setState({
                error: 'Please enter all fields.'
            });
            return false;
        }

        if (password !== confirmPassword) {
            this.setState({
                error: 'Passwords do not match.'
            });
            return false;
        }

        return true;
    }
    submitAccount(event) {
        event.preventDefault();
        if (!this.isValid()) {
            return;
        }
        this.props.createAccount(this.state.email, this.state.password).then( () => {
            this.props.history.replace('/');
        }).catch(err => {
            this.setState({ error: err.message })});
    }

    renderBody() {
        const errStyle = {
            borderColor: 'red'
        };
        
        return (
            <div>
                <form onSubmit={ event => this.submitAccount(event)} >
                <InputField id="email" type="text" label="Email" 
                    inputAction={(event) => this.setState({email: event.target.value})}
                    style={this.state.error ? errStyle : null} />
                <InputField id="password" type="password" label="Password" 
                    inputAction={(event) => this.setState({password: event.target.value})}
                    style={this.state.error ? errStyle : null} />
                <InputField id="confirm-password" type="password" label="Confirm password" 
                    inputAction={(event) => this.setState({confirmPassword: event.target.value})}
                    style={this.state.error ? errStyle : null} />
                {this.state.error && <ErrorAlert>
                    {this.state.error}
                </ErrorAlert>}
                <FooterFormButton submitLabel="Create" otherLabel="Go back" goToLink="/login" {...this.props}/>
                </form>
            </div>
        )
    }

    render(){
        return (
            <div>
                <SimpleBox body={this.renderBody()} title="Create account" />
            </div>
        )
    }
}

export default connect(null, { createAccount })(CreateAccount);