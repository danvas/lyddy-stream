import React, { Component } from 'react';
import SimpleBox from '../components/SimpleBox';
import InputField from '../components/InputField';
import FooterFormButton from '../components/FooterFormButton';
import ErrorAlert from '../components/ErrorAlert'
import { login, getUser, fetchUserData } from '../actions/UserActions';
import { selectStream } from '../actions'
import { connect } from 'react-redux';

class Login extends Component {

    constructor(props) {
        console.log("Login.constructor()...")
        super(props);
        this.state = {
            email: '',
            password: '',
            error: ''
        }
        props.getUserCred()
    }

    static getDerivedStateFromProps(nextProps, prevState){
        console.log("Login.getDerivedStateFromProps()...")
        // console.log(nextProps)
        const { user, history } = nextProps;
        if (user.loggedIn && !user.isLoading) {
            console.log("going to main page!...")
            history.push('/')
        }
        return null
    }

    submitLogin(event) {
        console.log("Login.submitLogin()...")
        event.preventDefault();
        const { login, getUserData, selectStream } = this.props
        login(this.state.email, this.state.password)
        .then(userCred => {
            const streamKey = userCred.user.uid
            getUserData(streamKey)
            selectStream("")
        })
        .catch(err => {
            this.setState({
                error: err
            });
        });
    }

    componentDidUpdate() {
        console.log("Login.componentDIDUpdate...")
        const { getUserData, selectStream, user } = this.props
        if (user.uid) {
            getUserData(user.uid)
            selectStream("")            
        }
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
        console.log("Login.RENDER()...", this.props)
        const { user, history } = this.props
        if (user.isLoading) {
            return <div><h2>Loading...</h2></div>
        } else {
            return (
                <div>
                    <SimpleBox title="Sign in" body={this.renderBody()}/>
                </div>
            )
        }
    }
}

function mapStateToProps(state) {
    return { user: state.user }
}

const mapDispatchToProps = dispatch => ({
    login: (username, password) => dispatch(login(username, password)),      
    getUserData: userId => dispatch(fetchUserData(userId)),
    getUserCred: () => dispatch(getUser()),
    selectStream: (key) => dispatch(selectStream(key))
})

export default connect(mapStateToProps, mapDispatchToProps)(Login);

