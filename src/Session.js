import React from "react";
import {Database} from "./Database";
import firebase from "firebase";
import {CustomDialog, useDialog} from 'react-st-modal';

class ChooseCharacterOptions extends React.Component {

    constructor(props) {
        super(props);

        this.state = {characterList: []};
        this.database = new Database();
    }

    componentDidMount() {
        let ctrl = this;

        this.database.read("/users/" + this.props.uid, function (response) {

            let elements = [];

            // new user or first this.state.time user
            if (response == null) {
                elements.push((<div key={0}>No Account or no characters available</div>));
            } else {
                let characters = Object.keys(response.characters);

                for (let i = 0; i < characters.length; i++) {
                    elements.push((
                        <div key={i}><label><input type="radio" name="character" value={characters[i]}
                                                   onClick={() => ctrl.props.result["selected"] = response.characters[characters[i]]}/>&nbsp;{characters[i]}</label>
                        </div>));
                }
            }

            ctrl.setState({characterList: elements});
        });

    }

    render() {
        return (
            <div>
                <h3>Choose a character</h3>
                <form id="character_select">
                    {this.state.characterList}
                </form>
                <small>Don't see your character? Make one here: &nbsp;</small>
                <a className="btn btn-success" href="/create" target="_blank">Create</a>
                <br/>
            </div>
        );
    }
}

function ChooseCharacterDialog(props) {
    const dialog = useDialog();
    let result = {"selected": "dm"};

    return (
        <div className="container">
            <ChooseCharacterOptions uid={props.uid} result={result}></ChooseCharacterOptions>
            <button className="btn btn-success" onClick={() => dialog.close(result)}>Save</button>
        </div>
    );
}

export class Session extends React.Component {

    constructor(props) {
        super(props);

        let sid = this.props.match.params.id;

        if (sid == null || sid == "") {
            alert("Invalid session ID");
            window.location = "/session";
            return;
        }

        this.state = {
            uid: null,
            sessionId: sid,
            uuid_character_dict: {},
            time: null,
            turnOrder: [],
            changeInitiativeTurnOrder: [],
            paused: false,
            sessionName: "Session",
            dm: null,
            characterSelected: false,
            onDeckList: [],
            setTurnList: []
        };
        this.database = new Database();

        this.manageConnectingPlayers = this.manageConnectingPlayers.bind(this);
        this.updateTime = this.updateTime.bind(this);
        this.setTurnOrder = this.setTurnOrder.bind(this);
        this.updateStateHost = this.updateStateHost.bind(this);
        this.getCharacterData = this.getCharacterData.bind(this);
        this.pause = this.pause.bind(this);
        this.setTurn = this.setTurn.bind(this);
        this.changeInitiative = this.changeInitiative.bind(this);
        this.updateChangeInitiativeList = this.updateChangeInitiativeList.bind(this);
        this.shiftUp = this.shiftUp.bind(this);
        this.shiftDown = this.shiftDown.bind(this);
        this.updateStateClient = this.updateStateClient.bind(this);
    }

    updateStateClient() {

        this.updateSessionData();
        setTimeout(this.updateStateClient, 1000);
    }

    manageConnectingPlayers() {

        let ctrl = this;
        this.database.read("/sessions/" + this.state.sessionId + "/players", function (response) {

            // new user or first this.state.time user
            if (response == null) {
                ctrl.setState({turnOrder: []});
            } else {

                let connectedPlayers = Object.keys(response);

                let updatedPlayerList = [];
                let removed = false;

                for (let i = 0; i < ctrl.state.turnOrder.length; i++) {
                    if (ctrl.state.turnOrder[i] && !updatedPlayerList.includes(ctrl.state.turnOrder[i])) {
                        updatedPlayerList.push(ctrl.state.turnOrder[i]);
                    } else {
                        removed = true;
                    }
                }

                if (connectedPlayers.length > updatedPlayerList.length || updatedPlayerList.length != ctrl.state.turnOrder.length || removed) {

                    for (let i = 0; i < connectedPlayers.length; i++) {
                        if (!updatedPlayerList.includes(connectedPlayers[i])) {
                            updatedPlayerList.push(connectedPlayers[i]);
                        }
                    }

                    ctrl.updateTurnOrder(updatedPlayerList);
                }
            }
        });

        setTimeout(this.manageConnectingPlayers, 1000);
    }

    updateTurnOrder(turnOrder) {
        let ctrl = this;
        this.database.write("/sessions/" + this.state.sessionId + "/turnOrder", turnOrder).then(function (success) {
            ctrl.setState({turnOrder: turnOrder});
        }, function (failure) {
            alert("Failed to update player list.");
        });
    }

    updateTime(time) {
        let ctrl = this;
        this.database.write("/sessions/" + this.state.sessionId + "/timer", time).then(function (response) {
            ctrl.setState({time: time});

        }, function (error) {
            alert("Failed to update time");
            console.log(error);
        })
    }

    setTurnOrder() {
        let data = {};
        for (let i = 0; i < this.state.turnOrder.length; i++) {
            data[this.state.uuid_character_dict[this.state.turnOrder[i]]] = {
                "character": this.state.turnOrder[i],
                "order": i
            }
        }

        if (this.state.uid) {
            let ctrl = this;
            this.database.write("/sessions/" + this.state.sessionId + "/players", data).then(function (response) {

                // success
                document.getElementById("player_turn").innerHTML = ctrl.state.turnOrder[0];
                if (!ctrl.state.paused) {
                    ctrl.pause();
                }
                ctrl.state.time = 45;
                ctrl.setTime();

            }, function (error) {
                console.log("Something went wrong creating session");
                console.log(error);
            })
        }
        ;
    }

    updateStateHost() {

        if (!this.state.paused) {

            let time = this.state.time;
            time -= 1;

            if (time < 0) {

                time = 60;

                let turnOrder = this.state.turnOrder;
                if (turnOrder.length > 0) {
                    let prev = this.state.turnOrder[0];
                    turnOrder = this.state.turnOrder.slice(1);
                    turnOrder.push(prev);
                }

                this.updateTurnOrder(turnOrder);
            }

            this.updateTime(time);
        }
        setTimeout(this.updateStateHost, 1000);

    }

    getCharacterData(character) {
        console.log("Character clicked: ");
        console.log(character);
    }

    pause() {
        let paused = !this.state.paused;

        let ctrl = this;
        this.database.write("/sessions/" + this.state.sessionId + "/paused", paused).then(function (response) {
            ctrl.setState({paused: paused});
        }, function (error) {
            alert("Failed to pause game");
            console.log(error);
        });
    }

    setTurn(uid) {
        if (!this.state.paused) {
            this.pause();
        }
        this.updateTime(60);

        let index = this.state.turnOrder.indexOf(uid);

        let turnOrder = this.state.turnOrder.slice(index).concat(this.state.turnOrder.slice(0, index));
        this.updateTurnOrder(turnOrder);
    }

    changeInitiative() {
        if (!this.state.paused) {
            this.pause();
        }
        this.state.turnOrder = [];
        for (let i = 0; i < this.state.changeInitiativeTurnOrder.length; i++) {
            this.state.turnOrder.push(this.state.changeInitiativeTurnOrder[i]);
        }

        this.setTurnOrder();
        this.updateLocalPlayerList();
        this.updateSetTurnList();
    }

    updateChangeInitiativeList() {
        let el = document.getElementById("initative_chooser");
        el.innerHTML = "";
        this.state.changeInitiativeTurnOrder = [];
        let ctrl = this;
        for (let i = 0; i < this.state.turnOrder.length; i++) {

            const character = this.state.turnOrder[i];

            let li = document.createElement("li");
            let p = document.createElement("span");
            p.innerHTML = character;
            li.appendChild(p);

            let button = document.createElement("button");
            button.classList.add("btn", "btn-warning", "mx-3");

            button.onclick = function () {
                ctrl.shiftUp(character);
            };
            button.innerHTML = "Up";
            li.appendChild(button);

            button = document.createElement("button");
            button.classList.add("btn", "btn-warning", "mx-3");
            button.onclick = function () {
                ctrl.shiftDown(character);
            };
            button.innerHTML = "Down";
            li.appendChild(button);

            el.appendChild(li);
            this.state.changeInitiativeTurnOrder.push(this.state.turnOrder[i]);
        }
    }

    shiftUp(character) {

        let index = this.state.changeInitiativeTurnOrder.indexOf(character);

        if (index == 0) {
            return;
        }

        let el = document.getElementById("initative_chooser");
        let child = el.removeChild(el.children[index]);
        el.insertBefore(child, el.children[index - 1]);

        this.state.changeInitiativeTurnOrder[index] = this.state.changeInitiativeTurnOrder[index - 1];
        this.state.changeInitiativeTurnOrder[index - 1] = character;
    }

    shiftDown(character) {

        let index = this.state.changeInitiativeTurnOrder.indexOf(character);

        if (index == this.state.changeInitiativeTurnOrder.length - 1) {
            return;
        }

        let el = document.getElementById("initative_chooser");
        let child = el.removeChild(el.children[index]);
        el.insertBefore(child, el.children[index + 1]);

        this.state.changeInitiativeTurnOrder[index] = this.state.changeInitiativeTurnOrder[index + 1];
        this.state.changeInitiativeTurnOrder[index + 1] = character;
    }

    joinSessionAsPlayer(characterData) {

        let ctrl = this;
        ctrl.database.write("/sessions/" + this.state.sessionId + "/players/" + this.state.uid, {"character": characterData.name}).then(function (response) {
            ctrl.updateStateClient();

        }, function (error) {
            alert("Error joining session as player");
            console.log(error);
        });
    }

    joinSessionAsDM() {
        this.manageConnectingPlayers();
        this.updateStateClient();
        this.updateStateHost()
    }

    async showCharacterModal(dm) {

        let result;
        if (this.state.uid == dm) {
            result = {"selected": "dm"};
        } else {
            result = await CustomDialog(<ChooseCharacterDialog uid={this.state.uid} dm={dm}></ChooseCharacterDialog>, {title: "Character Selection", showCloseIcon: false, isCanClose: false});
        }

        this.state.characterSelected = true;

        if (result["selected"] == "dm") {
            this.joinSessionAsDM();
        } else {
            this.joinSessionAsPlayer(result["selected"]);
        }

    }

    updateSessionData() {

        let ctrl = this;
        this.database.read("/sessions/" + this.state.sessionId, function (response) {
            if (response) {

                if (!ctrl.state.characterSelected) {
                    ctrl.showCharacterModal(response.dm);
                }

                let onDeckList = [];
                let setTurnList = [];
                if (response.turnOrder) {
                    for (let i = 0; i < response.turnOrder.length; i++) {

                        if (!response.turnOrder[i]) {
                            response.turnOrder.splice(i, 1);
                            i--;
                            continue;
                        }

                        let charName = response.players[response.turnOrder[i]].character;
                        onDeckList.push((
                            <li key={i}>
                                <button className="btn btn-info" onClick={() => ctrl.getCharacterData(response.turnOrder[i])}>{charName}</button>
                            </li>
                        ));

                        setTurnList.push((
                            <button key={i} className="btn btn-info my-2 mx-2" onClick={() => ctrl.setTurn(response.turnOrder[i])}>{charName}</button>
                        ));
                    }
                }

                ctrl.setState({
                    sessionName: response.name,
                    paused: response.paused,
                    uuid_character_dict: response.players,
                    time: response.timer,
                    turnOrder: response.turnOrder ? response.turnOrder : [],
                    dm: response.dm,
                    onDeckList: onDeckList,
                    setTurnList: setTurnList
                });
            } else {
                ctrl.setState({
                    sessionName: "Session",
                    paused: true,
                    uuid_character_dict: {},
                    time: 60,
                    turnOrder: [],
                    dm: null,
                    onDeckList: [],
                    setTurnList: []
                });
            }
        });
    }

    componentDidMount() {

        let ctrl = this;

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                ctrl.updateSessionData();
                ctrl.setState({uid: user.uid});
            } else {
                ctrl.setState({uid: null});
            }
        });
    }

    render() {

        let element = (<div>Please login to join this session!</div>);
        let dm_controls = (<div></div>);

        if (this.state.uid) {

            if (this.state.uid == this.state.dm) {

                let pause_text = "Play";
                if (!this.state.paused) {
                    pause_text = "Pause";
                }

                dm_controls = (
                    <div id="dm_controls">
                        <div className="text-center">
                            <button type="button" className="btn btn-warning" id="pause_button" onClick={this.pause}>{pause_text}</button>
                        </div>
                        <div className="text-center my-3">
                            <h3>Set Turn</h3>
                            <div id="set_turn_div">{this.state.setTurnList}</div>
                        </div>
                        <div className="text-center my-3">
                            <h3>Change Initiative</h3>
                            <button type="button" className="btn btn-success my-2" id="apply_initiative" onClick={this.changeInitiative}>Apply
                                Initiative
                            </button>
                            <br/>
                            <ol id="initative_chooser"></ol>
                        </div>
                    </div>
                );
            }

            let current = "No Players Joined";
            if (this.state.turnOrder.length > 0) {
                current = this.state.uuid_character_dict[this.state.turnOrder[0]].character;
            }

            element = (
                <div>
                    <div className="text-center my-3">
                        <h2 id="session_title">{this.state.sessionName}</h2>
                        <p>Current Turn:</p>
                        <p id="player_turn">{current}</p>
                    </div>
                    <div className="row">
                        <div className="col-4">
                            <h3 className="text-center">Players On Deck</h3>
                            <ol id="player_list">{this.state.onDeckList}</ol>
                        </div>
                        <div className="col">
                            <h3 className="text-center">Abilities</h3>
                        </div>
                    </div>
                    <div className="text-center">
                        <p>Time Remaining:</p>
                        <output id="time_output">{this.state.time}</output>
                    </div>
                    {dm_controls}
                </div>
            );
        }

        return (
            <div id="session_details" className="container my-3 session-div">
                {element}
            </div>
        );
    }
}