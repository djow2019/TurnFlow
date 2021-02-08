import React from 'react';
import {Auth} from './Auth';

export class Header extends React.Component {

    render() {
        return (
            <nav className="navbar my-nav static-top">
                <div className="container">
                    <a className="navbar-brand" href="/">TurnFlow</a>
                    <a className="navbar-text" href="/create">Create Character</a>
                    <a className="navbar-text" href="/session">Host or Join Session</a>
                    <Auth/>
                </div>
            </nav>
        );
    }
}