import React from 'react';
import ReactDOM from 'react-dom';

import './css/index.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/@fortawesome/fontawesome-free/css/all.min.css';
import {Header} from './Header.jsx';
import Home from './Home.jsx';
import Footer from './Footer.jsx';
import {Create} from './Create.jsx';
import {SessionList} from './SessionList.jsx';
import {Session} from './Session.jsx';

import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
      <Router>
          <div id="global-container">
              <Header />

              <Switch>
                  <Route path="/create">
                      <Create />
                  </Route>
                  <Route path="/session/:id" component={Session}>
                  </Route>
                  <Route path="/session">
                      <SessionList />
                  </Route>
                  <Route path="/">
                      <Home />
                  </Route>
              </Switch>

              <Footer />
          </div>
      </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
