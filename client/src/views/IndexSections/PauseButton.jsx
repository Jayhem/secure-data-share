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
import React from "react";

// reactstrap components
import {
  Button,
} from "reactstrap";


class PauseButton extends React.Component {
  constructor(props) {
    super(props);
  this.state = {
    buttonText: {false:"Pause", true:"Unpause"}
  };

  // These bindings are necessary to make `this` work in the callbacks
  this.handlePause = this.handlePause.bind(this);
}
    // componentDidMount() {
    //     var buttonText = "Pause";
    //     console.log("in didMount, paused props : " + this.props.paused)

    //     if (this.props.paused) {
    //         buttonText = "Unpause";}
    //     this.setState({
    //         buttonText: buttonText    
    //     });
    // }
  handlePause = async state => {
    // var buttonText = "Pause";
    if (this.props.paused) {
        console.log("the contract is paused, I am unpausing it")
    await this.props.contract.methods.unpause().send({from:this.props.accounts[0]});
    }
    else {
        console.log("the contract is not paused, I am pausing it")
        await this.props.contract.methods.pause().send({from:this.props.accounts[0]});
     }
    await this.props.onWeb3Change();
    // console.log("in handlePause after onWeb3Change, paused props : " + this.props.paused)

    // if (this.props.paused) {
    //     buttonText = "Unpause";}
    // this.setState({
    //     buttonText: buttonText
    //   });
  
    
  };


  render() {
    // building list for the content that has been shared with the user

      return (
      <>
          <Button 
          className="btn-1 ml-1" 
          color="primary" 
          type="button"
          disabled={!this.props.owner}
          onClick={this.handlePause} >
            {this.state.buttonText[this.props.paused]}
          </Button>
      </>
    );
  }
}

export default PauseButton;
