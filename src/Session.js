import React from "react";
import firebase from "firebase";
import {Database} from "./Database";
import { TablePagination } from 'react-pagination-table';

export class Session extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            uid: null, 
            sessionId: null, 
            sessionTableHeaders: ["Campaign Name", "Players", "Session Join"],
            sessionListData: [],
            uuid_character_dict: {},
            time: null,
            turnOrder: [],
            changeInitiativeTurnOrder: [],
            paused: false
        };
        this.database = new Database();

        this.displaySessions = this.displaySessions.bind(this);
        this.joinSessionAsPlayer = this.joinSessionAsPlayer.bind(this);
        this.joinSessionAsDM = this.joinSessionAsDM.bind(this);
        this.joinSession = this.joinSession.bind(this);
        this.getSessionData = this.getSessionData.bind(this);
        this.updateLocalPlayerList = this.updateLocalPlayerList.bind(this);
        this.updateStateClient = this.updateStateClient.bind(this);
        this.displayCreateSession = this.displayCreateSession.bind(this);
        this.createSession = this.createSession.bind(this);
        this.updateSetTurnList = this.updateSetTurnList.bind(this);
        this.checkForConnectingPlayers = this.checkForConnectingPlayers.bind(this);
        this.setTime = this.setTime.bind(this);
        this.setTurnOrder = this.setTurnOrder.bind(this);
        this.updateStateHost = this.updateStateHost.bind(this);
        this.getCharacterData = this.getCharacterData.bind(this);
        this.pause = this.pause.bind(this);
        this.setTurn = this.setTurn.bind(this);
        this.changeInitiative = this.changeInitiative.bind(this);
        this.updateChangeInitiativeList = this.updateChangeInitiativeList.bind(this);
        this.shiftUp = this.shiftUp.bind(this);
        this.shiftDown = this.shiftDown.bind(this);
        
    }

    componentDidMount() {
        let ctrl = this;

        if (firebase.auth().currentUser) {
            this.state.uid = firebase.auth().currentUser.uid;
        }

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                ctrl.state.uid = user.uid;
                ctrl.displaySessions();
            }
        });

    }

    displaySessions() {

        if (this.state.uid) {
            let ctrl = this;
            let uid = this.state.uid;
            this.database.read("/users/" + uid, function(response) {

                // new user or first this.state.time user
                if (response == null) {
                    console.log("No account or no characters available");
                } else {
                    let el = document.getElementById("character_select");
                    let characters = Object.keys(response.characters);
                    let template = `<label><input type="radio" name="character" value="dm" checked> Enter as DM</label><br>`;

                    for (let i = 0; i < characters.length; i++) {
                        template += `<label><input type="radio" name="character" value="${characters[i]}"> ${characters[i]}</label><br>`;
                    }
                    el.innerHTML = template;
                }
            });
            this.database.read("/sessions", function(response) {

                // new user or first this.state.time user
                if (response == null || Object.keys(response).length == 0) {
                    console.log("No active sessions");
                } else {
                    let data = [];
                    for (let key in response) {

                        let button = <button className="btn btn-info" onClick={() => ctrl.joinSession(key, response[key])}>{response[key].name}</button>;

                        let players = response[key].players;
                        if (players) {
                            players = Object.keys(players).length;
                        } else {
                            players = 0;
                        }

                        data.push({
                            "Campaign Name":  response[key].name,
                            "Players": players,
                            "Session Join": button
                        });
                    }

                    ctrl.setState({sessionListData: data});
                }
            });
        };

    }

    joinSessionAsPlayer(sid, data) {

        let form = document.getElementById("character_select").elements;
        let character;
        for (let j = 0; j < form.length; j++) {
            if (form[j].checked) {
                character = form[j].value;
                break;
            }
        }

        if (character == null) {
            console.log("Must select a character to join a session");
            return;
        }

        if (this.state.uid) {

            let uid = this.state.uid;
            let ctrl = this;
            this.database.read("/sessions/" + sid + "/players", function(response) {

                let length;
                if (response) {
                    length = Object.keys(response).length;

                    let found = false;
                    for (let key in response) {
                        if (key == uid) {
                            found = true;
                        }
                    }

                    if (found) {
                        console.log(uid + " character " + character + " has been written to session");

                        document.getElementById("session_title").innerHTML = data.name;
                        document.getElementById("options").classList.add("d-none");
                        document.getElementById("session_details").classList.remove("invisible");
                        document.getElementById("dm_controls").classList.add("d-none");
                        ctrl.setState({sessionId: sid});
                        ctrl.updateStateClient(data);
                        return;
                    }
                } else {
                    length = 0;
                }

                ctrl.database.write("/sessions/" + sid + "/players/" + uid, {"character": character, "order": length}).then(function(response) {
                    console.log(uid + " character " + character + " has been written to session");

                    document.getElementById("session_title").innerHTML = data.name;
                    document.getElementById("options").classList.add("d-none");
                    document.getElementById("session_details").classList.remove("invisible");
                    document.getElementById("dm_controls").classList.add("d-none");
                    ctrl.setState({sessionId: sid});
                    ctrl.updateStateClient(data);

                }, function(error){
                    console.log("Something went wrong writing " + character + " to database");
                    console.log(error);
                })
            });
        }
    }

    joinSessionAsDM(sid, data) {

        document.getElementById("session_title").innerHTML = data.name;
        document.getElementById("options").classList.add("d-none");
        document.getElementById("session_details").classList.remove("invisible");
        this.state.sessionId = sid;

        this.state.time = data.timer;
        this.state.paused = data.paused;

        document.getElementById("time_output").innerHTML = this.state.time;

        console.log(data);

        if (data.hasOwnProperty("players")) {
            let oldTotal = this.state.turnOrder.length;
            let total = Object.keys(data.players).length;
            let next = this.state.turnOrder.length;
            this.state.turnOrder = [];
            for (let i = 0; i < total; i++) {
                this.state.turnOrder.push("");
            }
            for (let key in data.players) {
                if (data.players[key].hasOwnProperty("order")) {
                    this.state.turnOrder[data.players[key].order] = data.players[key].character;
                } else {
                    this.state.turnOrder[next++] = data.players[key].character;
                }
                this.state.uuid_character_dict[data.players[key].character] = key;
            }

            if (this.state.turnOrder.length == 0 ) {
                document.getElementById("player_turn").innerHTML = "No Current Players";
            } else {
                this.updateLocalPlayerList();
                this.setTurnOrder();
                this.updateSetTurnList();
                this.updateChangeInitiativeList();
            }
        }

        this.checkForConnectingPlayers();
    }
    
    joinSession(sid, data) {

        let form = document.getElementById("character_select").elements;
        let character;
        for (let j = 0; j < form.length; j++) {
            if (form[j].checked) {
                character = form[j].value;
                break;
            }
        }

        if (character == "dm") {
            this.joinSessionAsDM(sid, data);
        } else {
            this.joinSessionAsPlayer(sid, data);
        }
    }

    getSessionData() {
        let ctrl = this;
        this.database.read("/sessions/" + this.state.sessionId, function(response) {

            // new user or first this.state.time user
            if (response == null) {
                console.log("Session Closed");
            } else {
                ctrl.updateStateClient(response);
            }
        });
    }

    updateLocalPlayerList() {
        let el = document.getElementById("player_list");
        el.innerHTML = "";
        let ctrl = this;

        for (let i = 0; i < this.state.turnOrder.length; i++) {
            let li = document.createElement("li");
            let button = document.createElement("button");
            button.classList.add("btn", "btn-info");
            button.onclick = function () { ctrl.getCharacterData(ctrl.state.turnOrder[i]); };
            button.innerHTML = this.state.turnOrder[i];
            li.appendChild(button);
            el.appendChild(li);
        }
    }

    updateStateClient(data) {

        this.state.time = data.timer;
        this.state.paused = data.paused;

        let prev;
        if (this.state.turnOrder.length > 1) {
            prev = this.state.turnOrder[0];
        }

        if (data.hasOwnProperty("players")) {
            let oldTotal = this.state.turnOrder.length;
            let total = Object.keys(data.players).length;
            this.state.turnOrder = [];
            for (let i = 0; i < total; i++) {
                this.state.turnOrder.push("");
            }
            let next = 0;
            for (let key in data.players) {
                if (data.players[key].hasOwnProperty("order")) {
                    let order = data.players[key].order;
                    this.state.turnOrder[order] = data.players[key].character;

                    if (order > next) {
                        next = order;
                    }

                }
            }
            for (let key in data.players) {
                if (!data.players[key].hasOwnProperty("order")) {
                    this.state.turnOrder[++next] = data.players[key].character;
                }
            }

            // turn order out of sync, redraw
            //if (oldTotal != total || prev != this.state.turnOrder[0]) {
                this.updateLocalPlayerList();
            //}
        }

        document.getElementById("time_output").innerHTML = this.state.time;
        document.getElementById("player_turn").innerHTML = this.state.turnOrder[0];

        setTimeout(this.getSessionData, 1000);
    }

    displayCreateSession() {
        document.getElementById("create_session_div").classList.remove("invisible");
    }

    createSession() {
        let sname = document.getElementById("session_name").value;
        console.log(sname);

        if (sname == null || sname == "") {
            console.log("Must have valid session name");
            return;
        }

        let sid = Math.floor(Math.random() * 1000000);

        if (this.state.uid) {
            let data = {"name": sname, "paused": true, "timer": 45};
            let ctrl = this;
            this.database.write("/sessions/" + sid, data).then(function(response) {
                // success
                document.getElementById("create_session_div").classList.add("d-none");
                document.getElementById("session_title").innerHTML = data.name;
                document.getElementById("options").classList.add("d-none");
                document.getElementById("session_details").classList.remove("invisible");
                ctrl.state.sessionId = sid;

                ctrl.state.time = data.timer;
                ctrl.state.paused = data.paused;

                document.getElementById("time_output").innerHTML = ctrl.state.time;
                document.getElementById("player_turn").innerHTML = "No Current Players";

                ctrl.checkForConnectingPlayers();

            }, function(error){
                console.log("Something went wrong creating session");
                console.log(error);
            })
        };

    }

    updateSetTurnList() {

        let el = document.getElementById("set_turn_div");
        el.innerHTML = "";

        let ctrl = this;
        for (let i = 0; i < this.state.turnOrder.length; i++) {
            let button = document.createElement("button");
            button.classList.add("btn", "btn-info", "my-2", "mx-2");
            button.onclick = function () { ctrl.setTurn(ctrl.state.turnOrder[i])};
            button.innerHTML = this.state.turnOrder[i];
            el.appendChild(button);
        }
    }

    checkForConnectingPlayers() {

        if (this.state.uid) {
            let uid = this.state.uid;
            let ctrl = this;
            this.database.read("/sessions/" + this.state.sessionId + "/players", function(response) {

                // new user or first this.state.time user
                if (response == null) {
                    console.log("No players available.");
                } else {
                    let needsUpdating = false;
                    for (let uuid in response){
                        if (!response[uuid].hasOwnProperty("order")) {
                            if (!ctrl.state.uuid_character_dict.hasOwnProperty(response[uuid].character)) {
                                ctrl.state.uuid_character_dict[response[uuid].character] = uuid;
                                ctrl.state.turnOrder.push(response[uuid].character);
                            }
                            needsUpdating = true;
                        }
                    }

                    if (needsUpdating) {
                        ctrl.setTurnOrder();
                        ctrl.updateLocalPlayerList();
                        ctrl.updateSetTurnList();
                        ctrl.updateChangeInitiativeList();
                    }
                }
            });
        };

        setTimeout(this.checkForConnectingPlayers, 1000);
    }

    setTime() {
        if (this.state.uid) {
            let ctrl = this;
            this.database.write("/sessions/" + this.state.sessionId + "/timer", this.state.time).then(function(response) {
                // success
                document.getElementById("time_output").innerHTML = ctrl.state.time;

            }, function(error){
                console.log("Something went wrong creating session");
                console.log(error);
            })
        };
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
            this.database.write("/sessions/" + this.state.sessionId + "/players", data).then(function(response) {

                // success
                document.getElementById("player_turn").innerHTML = ctrl.state.turnOrder[0];
                if (!ctrl.state.paused) {
                    ctrl.pause();
                }
                ctrl.state.time = 45;
                ctrl.setTime();

            }, function(error){
                console.log("Something went wrong creating session");
                console.log(error);
            })
        };
    }

    updateStateHost() {

        if (this.state.paused) {
            return;
        }

        this.state.time -= 1;

        if (this.state.time < 0) {

            if (this.state.turnOrder.length == 0) {
                this.state.time = 45;
                if (!this.state.paused) {
                    this.pause();
                }
                this.setTime();
                return;
            }

            let prev = this.state.turnOrder[0];
            this.state.turnOrder = this.state.turnOrder.slice(1);
            this.state.turnOrder.push(prev);

            this.setTurnOrder();
            this.updateLocalPlayerList();
            this.updateSetTurnList();

        } else {
            this.setTime();
            setTimeout(this.updateStateHost, 1000);
        }

    }

    getCharacterData(character) {
        console.log("Character clicked: ");
        console.log(character);
    }

    pause() {
        this.state.paused = !this.state.paused;

        if (this.state.uid) {
            let ctrl = this;
            this.database.write("/sessions/" + this.state.sessionId + "/paused", this.state.paused).then(function(response) {
                // success
                if (ctrl.state.paused) {
                    document.getElementById("pause_button").innerHTML = "Play";
                } else {
                    document.getElementById("pause_button").innerHTML = "Pause";
                    setTimeout(ctrl.updateStateHost, 1000);
                }

            }, function(error){
                console.log("Something went wrong pausing");
                console.log(error);
            })
        };

    }

    setTurn(name) {
        if (!this.state.paused) {
            this.pause();
        }
        this.state.time = 45;
        this.setTime();

        let index = this.state.turnOrder.indexOf(name);
        this.state.turnOrder = this.state.turnOrder.slice(index).concat(this.state.turnOrder.slice(0, index));
        this.setTurnOrder();
        this.updateLocalPlayerList();
        this.updateSetTurnList();
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

            button.onclick = function () { ctrl.shiftUp(character);};
            button.innerHTML = "Up";
            li.appendChild(button);

            button = document.createElement("button");
            button.classList.add("btn", "btn-warning", "mx-3");
            button.onclick = function () { ctrl.shiftDown(character);};
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

    render() {
        return (
            <div className="container my-3 session-div">

                <div id="options">
                    <h1 className="text-center">Campaign Select</h1>

                    <h3>Choose a character</h3>
                    <form id="character_select"></form>
                    <small>Don't see your character? Make one here: &nbsp;</small>
                    <a className="btn btn-success" href="/create" target="_blank">Create</a>

                    <hr/>

                    <div id="session_table">
                        <TablePagination
                            title="Available Sessions"
                            headers={ this.state.sessionTableHeaders }
                            data={ this.state.sessionListData }
                            columns="Campaign Name.Players.Session Join"
                            perPageItemCount={ 10 }
                            totalCount={ this.state.sessionListData.length }
                            arrayOption={ [] }
                        />
                    </div>

                    <div className="row">
                        <div className="col-7"></div>
                        <button className="col-4 btn btn-info" id="create_session" onClick={this.displayCreateSession}>Create a session</button>
                        <div className="col-1"></div>
                    </div>

                    <div id="create_session_div" className="invisible">
                        <label>Session Name: <input type="text" id="session_name"/></label><br/>
                        <button type="button" className="btn btn-success" id="create_session_button" onClick={this.createSession}>Create</button>
                    </div>
                </div>

                <div id="session_details" className="invisible">
                    <div className="text-center my-3">
                        <h2 id="session_title">Session Title</h2>
                        <p>Current Turn:</p>
                        <p id="player_turn"></p>
                    </div>
                    <div className="row">
                        <div className="col-4">
                            <h3 className="text-center">Players On Deck</h3>
                            <ol id="player_list"></ol>
                        </div>
                        <div className="col">
                            <h3 className="text-center">Abilities</h3>
                        </div>
                    </div>
                    <div className="text-center">
                        <p>Time Remaining:</p>
                        <output id="time_output"></output>
                    </div>
                    <div id="dm_controls">
                        <div className="text-center">
                            <button type="button" className="btn btn-warning" id="pause_button" onClick={this.pause}>Play</button>
                        </div>
                        <div className="text-center my-3">
                            <h3>Set Turn</h3>
                            <div id="set_turn_div"></div>
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

                </div>
            </div>
        );
    }
}