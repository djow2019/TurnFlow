import React from 'react';
import ReactDOM from 'react-dom';

import './css/index.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/@fortawesome/fontawesome-free/css/all.min.css';
import {Header} from './Header.js';
import Home from './Home.js';
import Footer from './Footer.js';
import {Create} from './Create.js';
import {Session} from './Session.js';
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
                  <Route path="/session">
                      <Session />
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
