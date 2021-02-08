import React from "react";
import firebase from "firebase";
import {Database} from "./Database";

export class Create extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            uid: null,
            reference: null
        };

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
                ctrl.setState({uid: null});
            }

        });

    }

    render() {

        let reference = (<div>Please select a reference book.</div>);
        if (this.state.reference === "dd4e") {
            reference = (<DND4EComponent></DND4EComponent>)
        } else if (this.state.reference === "pathfinder") {
            reference = (<PathfinderComponent></PathfinderComponent>)
        } else if (this.state.reference === "dd5e") {
            reference = (<DND5EComponent uid={this.state.uid}></DND5EComponent>);
        }


        return (
            <div className="container create-div">
                <div className="container d-none text-center my-5" id="character_success_form">
                    <h2>Character successfully saved!</h2>
                    <h4>If you would like to make another, please refresh the page.</h4>
                    <h4>Otherwise, you are ready to join a session!</h4>
                </div>
                <div id="character_creation_form">
                    <div className="text-center">
                        <h1>Create a character</h1>
                    </div>
                    <div className="border text-center" id="create_sheet">
                        <label className="pt-2">Character Name: <input type="text" id="name"/></label>
                        <hr/>
                        <div className="py-2 px-2">
                            <h5 className="text-left pl-2">Stats</h5>
                            <hr/>
                            <div className="row">
                                <div className="col-2">
                                    <label htmlFor="strength">Strength: </label>
                                </div>
                                <div className="col-4">
                                    <input type="text" id="strength"/>
                                </div>
                                <div className="col-2">
                                    <label htmlFor="intelligence">Intelligence: </label>
                                </div>
                                <div className="col-4">
                                    <input type="text" id="intelligence"/>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-2">
                                    <label htmlFor="dexterity">Dexterity: </label>
                                </div>
                                <div className="col-4">
                                    <input type="text" id="dexterity"/>
                                </div>
                                <div className="col-2">
                                    <label htmlFor="wisdom">Wisdom: </label>
                                </div>
                                <div className="col-4">
                                    <input type="text" id="wisdom"/>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-2">
                                    <label htmlFor="constitution">Constitution: </label>
                                </div>
                                <div className="col-4">
                                    <input type="text" id="constitution"/>
                                </div>
                                <div className="col-2">
                                    <label htmlFor="charisma">Charisma: </label>
                                </div>
                                <div className="col-4">
                                    <input type="text" id="charisma"/>
                                </div>
                            </div>

                        </div>

                        <hr/>
                        <div className="px-2">
                            <h5 className="text-left pl-2">Combat</h5>
                            <hr/>
                            <div className="row">
                                <div className="col-2">
                                    <label htmlFor="hp">Hit Points: </label>
                                </div>
                                <div className="col-4">
                                    <input type="text" id="hp"/>
                                </div>
                                <div className="col-2">
                                    <label htmlFor="ac">AC: </label>
                                </div>
                                <div className="col-4">
                                    <input type="text" id="ac"/>
                                </div>
                            </div>

                        </div>
                        <hr/>

                        <div className="text-left px-3">
                            <h5 className="text-left">Reference book</h5>
                            <hr/>
                            <form id="reference_form">
                                <label>
                                    <input type="radio" name="ref_select" value="dd4e" onClick={() => this.setState({reference: "dd4e"})}/>
                                    &nbsp;DND 4E
                                </label>
                                <br/>
                                <label>
                                    <input type="radio" name="ref_select" value="dd5e" onClick={() => this.setState({reference: "dd5e"})}/>
                                    &nbsp;DND 5E
                                </label>
                                <br/>
                                <label>
                                    <input type="radio" name="ref_select" value="pathfinder" onClick={() => this.setState({reference: "pathfinder"})}/>
                                    &nbsp;Pathfinder
                                </label>
                                <br/>
                            </form>
                            {reference}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class DND5EComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            classes: <div></div>,
            deities: <div></div>,
            feats: <div></div>,
            races: <div></div>,
            spells: <div></div>
        };

        this.data = {
            "class": "",
            "deity": "",
            "feat": "",
            "race": "",
            "spell": ""
        };

        this.oldUid = this.props.uid;
        this.database = new Database();

        this.updateFields = this.updateFields.bind(this);
    }

    updateFields() {
        if (this.props.uid) {
            let ctrl = this;
            this.database.read("/references/dd5e", function (response) {
                if (response != null) {

                    let classes = Object.keys(response.classes).map((key) => (
                        <div key={key}><label><input type="radio" name="class_select" value={key} onClick={() => ctrl.data.class = key}/>&nbsp;{key}</label></div>));
                    let deities = Object.keys(response.deities).map((key) => (
                        <div key={key}><label><input type="radio" name="deity_select" value={key} onClick={() => ctrl.data.deity = key}/>&nbsp;{key}</label></div>));
                    let feats = Object.keys(response.feats).map((key) => (
                        <div key={key}><label><input type="radio" name="race_select" value={key} onClick={() => ctrl.data.race = key}/>&nbsp;{key}</label></div>));
                    let races = Object.keys(response.races).map((key) => (
                        <div key={key}><label><input type="radio" name="spell_select" value={key} onClick={() => ctrl.data.spell = key}/>&nbsp;{key}</label></div>));
                    let spells = Object.keys(response.spells).map((key) => (
                        <div key={key}><label><input type="radio" name="feat_select" value={key} onClick={() => ctrl.data.feat = key}/>&nbsp;{key}</label></div>));

                    ctrl.setState({
                        classes: classes,
                        deities: deities,
                        feats: feats,
                        races: races,
                        spells: spells
                    });
                } else {
                    console.log("Something went wrong reading reference dd5e");
                }
            });
        } else {
            let ctrl = this;
            setTimeout(function () {
                ctrl.setState({
                    classes: <div></div>,
                    deities: <div></div>,
                    feats: <div></div>,
                    races: <div></div>,
                    spells: <div></div>
                });
            }, 500);
        }
    }

    componentDidMount() {
        this.updateFields();
    }

    render() {

        if (this.props.uid !== this.oldUid) {
            this.oldUid = this.props.uid;
            this.updateFields();
        }

        let save = <div>Please Login to Save your character</div>;
        if (this.props.uid) {
            save = <SaveComponent uid={this.props.uid} data={this.data} reference={"dd5e"}></SaveComponent>;
        }

        return (<div>
            <div id="race_select_div">
                <hr/>
                <h5>Race</h5>
                <form id="race_form">{this.state.races}</form>
            </div>

            <div id="class_select_div">
                <hr/>
                <h5>Class</h5>
                <form id="class_form">{this.state.classes}</form>
            </div>

            <div id="feat_select_div">
                <hr/>
                <h4>Feat(s)</h4>
                <form id="feat_form">{this.state.feats}</form>
            </div>

            <div id="deity_select_div">
                <hr/>
                <h4>Deity</h4>
                <form id="deity_form">{this.state.deities}</form>
            </div>

            <div id="spell_select_div">
                <hr/>
                <h4>Spells</h4>
                <form id="spell_form">{this.state.spells}</form>
            </div>
            {save}
        </div>);
    }
}

class DND4EComponent extends React.Component {
    render() {
        return <div>Currently not supported!</div>;
    }
}

class PathfinderComponent extends React.Component {
    render() {
        return <div>Currently not supported!</div>;
    }
}

class SaveComponent extends React.Component {

    constructor(props) {
        super(props);

        this.saveCharacter = this.saveCharacter.bind(this);
        this.database = new Database();
    }


    saveCharacter() {

        if (!this.props.uid) {
            alert("Please Login before proceeding");
            return;
        }

        let data = {
            "name": document.getElementById("name").value,
            "strength": document.getElementById("strength").value,
            "dexterity": document.getElementById("dexterity").value,
            "constitution": document.getElementById("constitution").value,
            "wisdom": document.getElementById("wisdom").value,
            "intelligence": document.getElementById("intelligence").value,
            "charisma": document.getElementById("charisma").value,
            "hp": document.getElementById("hp").value,
            "ac": document.getElementById("ac").value,
            "reference": this.props.reference
        };

        if (data.name === "") {
            console.log("Name is empty!");
            alert("Character name cannot be blank!");
            return;
        }

        if (this.props.data) {
            for (let [key, value] of Object.entries(this.props.data)) {
                data[key] = value;
            }
        }

        this.database.write("/users/" + this.props.uid + "/characters/" + data.name, data).then(function (response) {
            document.getElementById("character_creation_form").classList.add("d-none");
            document.getElementById("character_success_form").classList.remove("d-none");
        }, function (error) {
            console.log(error);
            alert("Something went wrong. Please contact an admin if this issue persists.");
        })
    }

    render() {
        return (
            <div className="my-3">
                <input type="button" id="submit_character" value="Submit" onClick={this.saveCharacter}/><br/>
            </div>
        );
    }
}