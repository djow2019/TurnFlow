import React from "react";
import firebase from "firebase";
import {Database} from "./Database";

export class Create extends React.Component {

    constructor(props) {
        super(props);

        this.state = {classes: null, deities: null, feats: null, races: null, spells: null, uid: null, reference: null};
        this.database = new Database();

        this.onReferenceClick = this.onReferenceClick.bind(this);
        this.loadData = this.loadData.bind(this);
        this.loadDeities = this.loadDeities.bind(this);
        this.loadFeats = this.loadFeats.bind(this);
        this.loadRaces = this.loadRaces.bind(this);
        this.loadSpells = this.loadSpells.bind(this);
        this.loadClasses = this.loadClasses.bind(this);
        this.saveCharacter = this.saveCharacter.bind(this);
    }

    componentDidMount() {
        let ctrl = this;

        if (firebase.auth().currentUser) {
            this.state.uid = firebase.auth().currentUser.uid;
        }

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                ctrl.state.uid = user.uid;
            }
        });
    }

    onReferenceClick() {
        let form = document.getElementById("reference_form").elements;
        for (let i = 0; i < form.length; i++) {
            if (form[i].checked) {
                this.state.reference = form[i].value;
                this.loadData(this.state.reference);
            }
        }
    }

    loadData(reference) {
        if (reference == "dd4e" || reference== "pathfinder") {
            document.getElementById("race_select_div").classList.add("invisible");
            document.getElementById("class_select_div").classList.add("invisible");
            document.getElementById("deity_select_div").classList.add("invisible");
            document.getElementById("feat_select_div").classList.add("invisible");
            document.getElementById("spell_select_div").classList.add("invisible");
            console.log("dd4e and pathfinder not supported at this time");
            return;
        }

        if (this.state.uid) {
            let ctrl = this;
            this.database.read("/references/" + reference, function(response) {
                if (response != null) {
                    ctrl.state.classes = response.classes;
                    ctrl.state.deities = response.deities;
                    ctrl.state.feats = response.feats;
                    ctrl.state.races = response.races;
                    ctrl.state.spells = response.spells;

                    ctrl.loadClasses();
                    ctrl.loadDeities();
                    ctrl.loadFeats();
                    ctrl.loadRaces();
                    ctrl.loadSpells();
                } else {
                    console.log("Something went wrong reading reference " + reference);
                }
            });
        } else {
            console.log("User is not signed in, cannot load references");
        }
    }

    loadClasses() {
        let form = document.getElementById("class_form");
        for (let i = 0; i < form.children.length; i++) {
            form.removeChild(form.children[i]);
            i--;
        }

        for (let key in this.state.classes) {
            let el = document.createElement("label");
            el.innerHTML = `<input type="radio" name="class_select" value="${key}"> ${key}`;
            form.appendChild(document.createElement("br"));
            form.appendChild(el);
        }

        document.getElementById("class_select_div").classList.remove("invisible");

    }

    loadDeities() {
        let form = document.getElementById("deity_form");
        for (let i = 0; i < form.children.length; i++) {
            form.removeChild(form.children[i]);
            i--;
        }
        for (let key in this.state.deities) {
            let el = document.createElement("label");
            el.innerHTML = `<input type="radio" name="deity_select" value="${key}"> ${key}`;
            form.appendChild(document.createElement("br"));
            form.appendChild(el);
        }

        document.getElementById("deity_select_div").classList.remove("invisible");

    }

    loadRaces() {
        let form = document.getElementById("race_form");
        for (let i = 0; i < form.children.length; i++) {
            form.removeChild(form.children[i]);
            i--;
        }
        for (let key in this.state.races) {
            let el = document.createElement("label");
            el.innerHTML = `<input type="radio" name="race_select" value="${key}"> ${key}`;
            form.appendChild(document.createElement("br"));
            form.appendChild(el);
        }

        document.getElementById("race_select_div").classList.remove("invisible");

    }

    loadSpells() {
        let form = document.getElementById("spell_form");
        for (let i = 0; i < form.children.length; i++) {
            form.removeChild(form.children[i]);
            i--;
        }
        for (let key in this.state.spells) {
            let el = document.createElement("label");
            el.innerHTML = `<input type="radio" name="spell_select" value="${key}"> ${key}`;
            form.appendChild(document.createElement("br"));
            form.appendChild(el);
        }

        document.getElementById("spell_select_div").classList.remove("invisible");

    }

    loadFeats() {
        let form = document.getElementById("feat_form");
        for (let i = 0; i < form.children.length; i++) {
            form.removeChild(form.children[i]);
            i--;
        }
        for (let key in this.state.feats) {
            let el = document.createElement("label");
            el.innerHTML = `<input type="radio" name="feat_select" value="${key}"> ${key}`;
            form.appendChild(document.createElement("br"));
            form.appendChild(el);
        }

        document.getElementById("feat_select_div").classList.remove("invisible");

    }

    saveCharacter() {

        if (!this.state.uid) {
            alert("Please Login before proceeding");
            return;
        }

        // character_creation_form
        let reference = this.state.reference;

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
            "reference": reference
        };

        if (data.name == "") {
            console.log("Name is empty!");
            alert("Character name cannot be blank!");
            return;
        }

        if (reference == null || reference == "") {
            console.log("No reference selected!");
            alert("You must select DND 5E");
            return;
        }

        let attributes = ["class", "race", "feat", "deity", "spell"];
        for (let i = 0; i < attributes.length; i++) {
            let attribute = attributes[i];
            let form = document.getElementById(attribute + "_form").elements;
            for (let j = 0; j < form.length; j++) {
                if (form[j].checked) {
                    data[attribute] = form[j].value;
                    break;
                }
            }
        }

        if (this.state.uid) {
            let uid = this.state.uid;
            this.database.write("/users/" + uid + "/characters/" + data.name, data).then(function(response) {
                console.log(uid + " character " + data.name + " has been written to database");
                document.getElementById("character_creation_form").classList.add("d-none");
                document.getElementById("character_success_form").classList.remove("d-none");
            }, function(error){
                console.log("Something went wrong writing " + data.name + " to database");
                console.log(error);
                alert("Something went wrong. Please contact an admin if this issue persists.");
            })
        };
    }

    render() {

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
                                    <input type="radio" name="ref_select" value="dd4e" onClick={this.onReferenceClick}/>
                                    DND 4E
                                </label>
                                <br/>
                                <label>
                                    <input type="radio" name="ref_select" value="dd5e" onClick={this.onReferenceClick}/>
                                    DND 5E
                                </label>
                                <br/>
                                <label>
                                    <input type="radio" name="ref_select" value="pathfinder"
                                           onClick={this.onReferenceClick}/>
                                    Pathfinder
                                </label>
                                <br/>
                            </form>


                            <div id="race_select_div" className="invisible">
                                <hr/>
                                <h5>Race</h5>
                                <form id="race_form"></form>
                            </div>

                            <div id="class_select_div" className="invisible">
                                <hr/>
                                <h5>Class</h5>
                                <form id="class_form"></form>
                            </div>

                            <div id="feat_select_div" className="invisible">
                                <hr/>
                                <h4>Feat(s)</h4>
                                <form id="feat_form"></form>
                            </div>

                            <div id="deity_select_div" className="invisible">
                                <hr/>
                                <h4>Deity</h4>
                                <form id="deity_form"></form>
                            </div>

                            <div id="spell_select_div" className="invisible">
                                <hr/>
                                <h4>Spells</h4>
                                <form id="spell_form"></form>
                            </div>
                        </div>
                        <div className="my-3">
                            <input type="button" id="submit_character" value="Submit" onClick={this.saveCharacter}/><br/>
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}