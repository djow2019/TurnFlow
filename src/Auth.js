import React from "react";
import firebase from "firebase";
import GoogleLogin from 'react-google-login';
import { GoogleLogout } from 'react-google-login';

/**
 * TurnAuth
 * Wrapper class for google's firebase authentication
 * with a custom UI
 */
export class Auth extends React.Component {

    /**
     * constructor(firebase)
     * Creates the UI template for basic login functions and adds them to the screen
     *
     * @require element with an id of 'login' to open the UI
     * @param firebase - instance of firebase to utilize
     * @param enforce - whether or not a non-logged in user should be kicked
     *
     */
    constructor (props) {
        super(props);

        if (!firebase.apps.length) {
            firebase.initializeApp({
                apiKey: "AIzaSyCy7Yi5K6KEBhlYF-fJ3DZ9JAbFuSDEyYA",
                authDomain: "turnflow.firebaseapp.com",
                databaseURL: "https://turnflow.firebaseio.com",
                projectId: "turnflow",
                storageBucket: "turnflow.appspot.com",
                messagingSenderId: "751871651181",
                appId: "1:751871651181:web:c2622f57808baab2d87e64"
            });
        } else {
            firebase.app();
        }

        this.state = {user: null, token: null};

        this.googleSignInSuccess = this.googleSignInSuccess.bind(this);
        this.googleSignInFailure = this.googleSignInFailure.bind(this);
        this.googleSignOut = this.googleSignOut.bind(this);
    }

    componentDidMount() {
        // check if the user is logged in and if not, redirect them, ASYNCHRONOUS
        let ctrl = this;
        firebase.auth().onAuthStateChanged(function (user) {
            if (!user) {
                console.log("You must sign in!")
            } else {
                ctrl.setState({"user": user.displayName, token: user.refreshToken});
            }
        });
    }

    googleSignInSuccess(response) {
        console.log("login success");

        var credential = firebase.auth.GoogleAuthProvider.credential(response.tokenId);

        // Sign in with credential from the Google user.
        firebase.auth().signInWithCredential(credential).catch(function(error) {
            console.log("Error in firebase.auth.signInWithCrediential(cred)");
            console.log(error);
        });
    }

    googleSignInFailure(response) {
        console.log("failure");
        console.log(response);
    }

    googleSignOut() {
        console.log("logged out");

        this.setState({user: null, token: null});
        firebase.auth().signOut();
    }

    render() {

        let display;
        if (this.state.user) {
            display = (
                <span>
                    <span>Hello, {this.state.user}! &nbsp;</span>
                    <GoogleLogout
                        clientId="751871651181-mpurrs53asglio3lp464eq6f4cdaa9hu.apps.googleusercontent.com"
                        buttonText="Logout"
                        onLogoutSuccess={this.googleSignOut}
                    />
                </span>
            );
        } else {
            display = (
                <span>
                    <GoogleLogin
                        clientId="751871651181-mpurrs53asglio3lp464eq6f4cdaa9hu.apps.googleusercontent.com"
                        buttonText="Login"
                        onSuccess={this.googleSignInSuccess}
                        onFailure={this.googleSignInFailure}
                        cookiePolicy={'single_host_origin'}
                    />
                </span>
            );
        }

        return display;
    }

}