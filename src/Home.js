import React from "react";

class Panel extends React.Component {

    constructor(props) {
        super(props);

        this.link = this.props.link;
        this.description = this.props.description;
        this.title = this.props.title;
    }

    render() {

        return (
            <div className="home-panel" onClick={() => window.location = "/" + this.link}>
                <h3>{this.title}</h3>
                <div style={{height: 100}}></div>
                <p>{this.description}</p>
            </div>
        )
    }
}

function Home() {
    return (
        <div className="container home-container">
            <div className="home-div">
                <h1>Welcome to TurnFlow!</h1>
                <p style={{margin: 10}}>TurnFlow is an initiative management system to improve the experience of playing table top
                RPGs like Dungeons and Dragons and Pathfinder. In order to use this service, please login with
                a google account in the upper right. Then, you may create a character to use for your sessions
                by clicking "Create Character", and then you can host or join a session by clicking "Host or
                Join Session".</p>
                <br/>
                <div className="row">
                    <div className="col-6 d-flex justify-content-around">
                        <Panel title="Create" link={"create"} description={"Create a character!"}></Panel>
                    </div>
                    <div className="col-6 d-flex justify-content-around">
                        <Panel title="Session" link={"session"} description={"Host or join a session!"}></Panel>
                    </div>
                </div>
            </div>


        </div>
    );
}

export default Home;