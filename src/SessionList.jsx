import React from "react";
import firebase from "firebase";
import {Database} from "./Database";
import {TablePagination} from 'react-pagination-table';
import swordLogo from './img/sword.png';
import torchLogo from './img/torch.png';

class Panel extends React.Component {

    render() {

        let choice = this.props.choice;
        let title;
        let description;
        let imgLink;

        if (choice === "host") {
            title = "Host a session";
            description = "Select this to create a new campaign. The user who creates the session will be the registered DM";
            imgLink = torchLogo;
        } else {
            title = "Join an existing session";
            description = "Select this to join a session that is already created. You will asked be asked to choose a character. If you are the creator of that session, you will join as DM.";
            imgLink = swordLogo;
        }

        return (
            <div className="session-panel" onClick={this.props.click}>
                <h3>{title}</h3>
                <img src={imgLink} title={title}/>
                <p>{description}</p>
            </div>
        )
    }
}

export class SessionList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            uid: null,
            sessionTableHeaders: ["Campaign Name", "Players", "Session Join"],
            sessionListData: [],
            activeSessions: (<div>There are no active sessions</div>),
            choice: null
        };
        this.database = new Database();
        this.oldUid = null;

        this.updateSessions = this.updateSessions.bind(this);
        this.createSession = this.createSession.bind(this);
    }

    componentDidMount() {
        let ctrl = this;

        if (firebase.auth().currentUser) {
            this.setState({uid: firebase.auth().currentUser.uid});
        }

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                ctrl.setState({uid: user.uid});
            } else {
                ctrl.setState({uid: null, choice: null});
            }
        });

    }

    updateSessions() {

        let ctrl = this;
        this.database.read("/sessions", function (response) {

            let data = [];
            let status;

            // new user or first this.state.time user
            if (response === null || Object.keys(response).length === 0) {
                status = (<div>There are no active sessions!</div>);
            } else {

                let numSessions = Object.keys(response).length;
                if (numSessions === 1) {
                    status = (<div>There is 1 active session</div>)
                } else {
                    status = (<div>There are {numSessions} active sessions</div>)
                }

                for (let key in response) {

                    let button = <button className="btn btn-info" onClick={() => window.location="/session/" + key}>{response[key].name}</button>;

                    let players = response[key].players;
                    if (players) {
                        players = Object.keys(players).length;
                    } else {
                        players = 0;
                    }

                    data.push({
                        "Campaign Name": response[key].name,
                        "Players": players,
                        "Session Join": button
                    });
                }
            }

            ctrl.setState({sessionListData: data, activeSessions: status});
        });
    }

    createSession() {
        let sname = document.getElementById("session_name").value;

        if (sname === null || sname === "") {
            alert("Must have valid session name");
            return;
        }

        // this has the potential to cause errors if there happens to be two servers with the same id
        let sid = Math.floor(Math.random() * 1000000);

        let data = {"name": sname, "paused": true, "timer": 60, "dm": this.state.uid};
        this.database.write("/sessions/" + sid, data).then(function (response) {
            // success
            window.location = "/session/" + sid;

        }, function (error) {
            alert("Something went wrong creating the server. Try again later!");
            console.log(error);
        })

    }

    render() {

        if (this.oldUid !== this.state.uid) {
            this.oldUid = this.state.uid;
        }

        let ctrl = this;
        let joinClick = function() {
            ctrl.state.choice = "join";
            ctrl.updateSessions();
        };
        let hostClick = function() {
            ctrl.setState({choice: "host"});
        };

        let selectChoice;
        if (!this.state.uid) {
            selectChoice = (
                <div>Please login to join or host a session</div>
            );
        } else if (!this.state.choice) {
            selectChoice = (
                <div className="row">
                    <div className="col-6 d-flex justify-content-around">
                        <Panel choice="join" click={joinClick}></Panel>
                    </div>
                    <div className="col-6 d-flex justify-content-around">
                        <Panel choice="host" click={hostClick}></Panel>
                    </div>
                </div>
            );
        } else {

            if (this.state.choice === "join") {
                selectChoice = (
                    <div>
                        {this.state.activeSessions}
                        <div id="session_table">
                            <TablePagination
                                title="Available Sessions"
                                headers={this.state.sessionTableHeaders}
                                data={this.state.sessionListData}
                                columns="Campaign Name.Players.Session Join"
                                perPageItemCount={10}
                                totalCount={this.state.sessionListData.length}
                                arrayOption={[]}
                            />
                        </div>
                    </div>
                );
            } else {
                selectChoice = (
                    <div>
                        <div id="create_session_div">
                            <label>Session Name: <input type="text" id="session_name"/></label><br/>
                            <button type="button" className="btn btn-success" id="create_session_button" onClick={this.createSession}>Create</button>
                        </div>
                    </div>
                )
            }

        }

        return (
            <div className="container session-div">
                <h1 className="text-center">Campaign Select</h1>
                {selectChoice}
            </div>
        );
    }
}