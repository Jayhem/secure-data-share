/* FROM ORIGINAL APP */

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import * as Sentry from '@sentry/browser';

/*!

=========================================================
* Argon Design System React - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-design-system-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-design-system-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "./assets/vendor/nucleo/css/nucleo.css";
import "./assets/vendor/font-awesome/css/font-awesome.min.css";
import "./assets/scss/argon-design-system-react.scss";



Sentry.init({dsn: "https://ca9176017a46450f9eb1fb59b0b5924b@sentry.io/1520978"});


ReactDOM.render(
    <BrowserRouter>
      <Switch>
        <Route path="/" exact render={props => <App {...props} />} />
        <Route
          path="/App"
          exact
          render={props => <App {...props} />}
        />
        <Redirect to="/" />
      </Switch>
    </BrowserRouter>,
    document.getElementById("root")
  );
  
/* This was the original one   
ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

*/
