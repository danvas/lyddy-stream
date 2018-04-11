import React, { Component } from 'react';
import SimpleBox from '../components/SimpleBox';
import InputField from '../components/InputField';
import FooterFormButton from '../components/FooterFormButton';
import ErrorAlert from '../components/ErrorAlert'
import { login, getUser } from '../actions/UserActions';
import { connect } from 'react-redux';

class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            error: ''
        }
    }

    componentWillMount() {
        this.props.getUser();
    }

    componentWillReceiveProps(nextProps) {
        const { user } = nextProps;
        if (user.email !== undefined) {
            this.props.history.push('/')
        }
    }

    submitLogin(event) {
        event.preventDefault();
        this.props.login(this.state.email, this.state.password).catch(err => {
            this.setState({
                error: err
            });
        });
    }

    renderBody() {
        const errStyle = {
            borderColor: 'red'
        };
            
        return (
            <form onSubmit={event => this.submitLogin(event)}>
                <div>
                    <InputField id="email" type="text" label="Email" 
                        inputAction={(event) => this.setState({email: event.target.value})}
                        style={this.state.error ? errStyle : null}/>
                    <InputField id="password" type="password" label="Password" 
                        inputAction={(event) => this.setState({password: event.target.value})}
                        style={this.state.error ? errStyle : null} />
                    {this.state.error && <ErrorAlert>Your username or password is incorrect.</ErrorAlert>}
                    <FooterFormButton submitLabel="Login" otherLabel="Create Account" goToLink="/create-account" {...this.props}/>
                </div>
                
            </form>
        )
    }

    render() {
        return (
            <div>
                <SimpleBox title="Sign in" body={this.renderBody()}/>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return { user: state.user }
}

export default connect(mapStateToProps, { login, getUser })(Login);

